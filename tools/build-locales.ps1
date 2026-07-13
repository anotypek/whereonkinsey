param([string]$SourceLanguage = 'en')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$source = Get-Content (Join-Path $root 'questions.js') -Raw -Encoding UTF8

$targets = @(
  @{ id = 'women'; label = 'women' },
  @{ id = 'men'; label = 'men' },
  @{ id = 'nonbinary'; label = 'non-binary people' }
)

$questions = [System.Collections.Generic.List[object]]::new()
$nextId = 1

$targetPattern = 'addTargeted\("(?<dimension>[^"]+)",\s*"(?<scale>[^"]+)",\s*\[(?<items>[\s\S]*?)\]\);'
foreach ($match in [regex]::Matches($source, $targetPattern)) {
  $json = '[' + ([regex]::Replace($match.Groups['items'].Value.Trim(), ',\s*$', '')) + ']'
  $stems = $json | ConvertFrom-Json
  foreach ($stem in $stems) {
    foreach ($target in $targets) {
      $questions.Add([ordered]@{
        id = 'q{0:d3}' -f $nextId
        text = $stem.Replace('{target}', $target.label)
      })
      $nextId++
    }
  }
}

$neutralPattern = 'addNeutral\("(?<dimension>[^"]+)",\s*"(?<scale>[^"]+)",\s*\[(?<items>[\s\S]*?)\]\);'
foreach ($match in [regex]::Matches($source, $neutralPattern)) {
  $json = '[' + ([regex]::Replace($match.Groups['items'].Value.Trim(), ',\s*$', '')) + ']'
  $items = $json | ConvertFrom-Json
  foreach ($text in $items) {
    $questions.Add([ordered]@{ id = 'q{0:d3}' -f $nextId; text = $text })
    $nextId++
  }
}

if ($questions.Count -ne 300) { throw "Expected 300 questions, found $($questions.Count)." }

$ui = [ordered]@{
  privateAssessment = 'Private self-assessment'
  orientationPrompt = 'What is your orientation?'
  exploreNow = 'Explore it now!'
  heroBefore = 'Attraction is more than a'
  heroLabel = 'label.'
  lede = 'Explore the patterns behind your experiences, fantasies, and connections — with nuance, privacy, and no judgement.'
  imageEyebrow = 'Come as you are'
  imageMessage = 'There is no wrong way to be you.'
  adaptiveQuestions = 'adaptive questions'
  toComplete = 'to complete'
  localOnly = 'Local-only'
  neverTransmitted = 'never transmitted'
  stepOne = 'Step 1 of 2'
  aboutYou = 'A little about you'
  formIntro = 'This helps us phrase questions respectfully and provide a more relevant analysis. Every field is optional.'
  genderIdentity = 'Gender identity'
  selectOption = 'Select an option'
  age = 'Age'
  enterAge = 'Enter your age'
  preliminaryTitle = 'For preliminary insight only'
  preliminaryBody = 'This assessment is a starting point for self-reflection. It cannot define your orientation and is not a clinical diagnosis or a substitute for professional advice.'
  consent = 'I confirm that I am 18 or older and consent to answering questions about sexuality and attraction.'
  begin = 'Begin the assessment'
  shameMessage = 'Your orientation is nothing to be ashamed of. Whatever you discover, it is simply one honest part of who you are.'
  back = 'Back to profile'
  question = 'Question'
  of = 'of'
  assessmentBegins = 'Your assessment begins here'
  questionHelp = 'Choose the answer that feels most natural. There are no right or wrong responses.'
  staysDevice = 'Your answer stays on this device'
  preferNot = 'Prefer not to answer'
  lastChoice = 'One last choice'
  continueHow = 'How would you like to continue?'
  dialogIntro = 'Choose a private one-time session or use an account to return to your results later.'
  oneTime = 'One-time assessment'
  oneTimeBody = 'No account. Results stay on this device.'
  recommended = 'Recommended'
  account = 'Create account or sign in'
  accountBody = 'Return to your results on another device.'
  nextStage = 'Next stage'
  footerDisclaimer = 'Preliminary self-assessment only — not a clinical or diagnostic tool.'
  privacy = 'Privacy'
  methodology = 'Methodology'
  about = 'About'
}

$answerScales = [ordered]@{
  frequency = @('Never', 'Rarely', 'Sometimes', 'Often', 'Very often')
  intensity = @('Not at all', 'Slightly', 'Moderately', 'Strongly', 'Extremely')
  desire = @('No desire', 'Low desire', 'Moderate desire', 'Strong desire', 'Very strong desire')
  experience = @('Never', 'Once', 'A few times', 'Often', 'Many times')
  agreement = @('Strongly disagree', 'Disagree', 'Neither', 'Agree', 'Strongly agree')
  comfort = @('Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable')
}

function Translate-TextBatch([string[]]$Texts, [string]$TargetLanguage) {
  $results = [System.Collections.Generic.List[string]]::new()
  $separator = ' ZXQSEP987 '
  for ($i = 0; $i -lt $Texts.Count; $i += 10) {
    $end = [Math]::Min($i + 9, $Texts.Count - 1)
    $chunk = $Texts[$i..$end]
    $joined = $chunk -join $separator
    $encoded = [Uri]::EscapeDataString($joined)
    $url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=$SourceLanguage&tl=$TargetLanguage&dt=t&q=$encoded"
    $response = Invoke-RestMethod -Uri $url -Method Get
    $translated = (($response[0] | ForEach-Object { $_[0] }) -join '')
    $parts = $translated -split '\s*ZXQSEP987\s*'
    if ($parts.Count -ne $chunk.Count) {
      $parts = @()
      foreach ($singleText in $chunk) {
        $singleEncoded = [Uri]::EscapeDataString($singleText)
        $singleUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=$SourceLanguage&tl=$TargetLanguage&dt=t&q=$singleEncoded"
        $singleResponse = Invoke-RestMethod -Uri $singleUrl -Method Get
        $parts += (($singleResponse[0] | ForEach-Object { $_[0] }) -join '')
        Start-Sleep -Milliseconds 80
      }
    }
    foreach ($part in $parts) { $results.Add($part.Trim()) }
    Start-Sleep -Milliseconds 120
  }
  return $results.ToArray()
}

$languages = [ordered]@{
  de = 'Deutsch'
  pl = 'Polski'
  ru = 'Русский'
  es = 'Español'
  'zh-CN' = '中文'
  ja = '日本語'
  ko = '한국어'
  pt = 'Português'
}

$locales = [ordered]@{}
$englishQuestions = [ordered]@{}
foreach ($question in $questions) { $englishQuestions[$question.id] = $question.text }
$locales.en = [ordered]@{ name = 'English'; ui = $ui; answerScales = $answerScales; questions = $englishQuestions }

$questionTexts = @($questions | ForEach-Object { $_.text })
$uiKeys = @($ui.Keys)
$uiTexts = @($ui.Values)
$scaleKeys = @($answerScales.Keys)
$scaleTexts = @()
foreach ($key in $scaleKeys) { $scaleTexts += $answerScales[$key] }

foreach ($language in $languages.GetEnumerator()) {
  Write-Host "Translating $($language.Key)..."
  $cacheDir = Join-Path $root '.locale-cache'
  [IO.Directory]::CreateDirectory($cacheDir) | Out-Null
  $cachePath = Join-Path $cacheDir ($language.Key + '.json')
  if (Test-Path $cachePath) {
    $cached = Get-Content $cachePath -Raw -Encoding UTF8 | ConvertFrom-Json
    $translatedQuestions = @($cached.questions)
    $translatedUi = @($cached.ui)
    $translatedScales = @($cached.scales)
  } else {
    $translatedQuestions = Translate-TextBatch $questionTexts $language.Key
    $translatedUi = Translate-TextBatch $uiTexts $language.Key
    $translatedScales = Translate-TextBatch $scaleTexts $language.Key
    [ordered]@{ questions = $translatedQuestions; ui = $translatedUi; scales = $translatedScales } | ConvertTo-Json -Depth 4 | Set-Content $cachePath -Encoding UTF8
  }

  $questionMap = [ordered]@{}
  for ($i = 0; $i -lt $questions.Count; $i++) { $questionMap[$questions[$i].id] = $translatedQuestions[$i] }
  $uiMap = [ordered]@{}
  for ($i = 0; $i -lt $uiKeys.Count; $i++) { $uiMap[$uiKeys[$i]] = $translatedUi[$i] }
  $scaleMap = [ordered]@{}
  $cursor = 0
  foreach ($key in $scaleKeys) {
    $scaleMap[$key] = @($translatedScales[$cursor..($cursor + $answerScales[$key].Count - 1)])
    $cursor += $answerScales[$key].Count
  }
  $locales[$language.Key] = [ordered]@{ name = $language.Value; ui = $uiMap; answerScales = $scaleMap; questions = $questionMap }
}

$json = $locales | ConvertTo-Json -Depth 8 -Compress
$output = "window.WhereOnKinseyLocales = $json;"
[IO.File]::WriteAllText((Join-Path $root 'locales.js'), $output, [Text.UTF8Encoding]::new($false))
Write-Host "Created locales.js with $($locales.Count) languages and $($questions.Count) questions per language."
