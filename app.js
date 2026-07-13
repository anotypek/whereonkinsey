const form = document.querySelector("#profile-form");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#theme-toggle");
const section1 = document.querySelector("#section1");
const assessmentSection = document.querySelector("#assessment-section");
const backToProfile = document.querySelector("#back-to-profile");
const cancelAssessmentButton = document.querySelector("#cancel-assessment");
const accessDialog = document.querySelector("#access-dialog");
const closeAccessDialog = document.querySelector("#close-access-dialog");
const continueOneTime = document.querySelector("#continue-one-time");
const continueAccount = document.querySelector("#continue-account");
const dialogOptions = document.querySelector(".dialog-options");
const accountPanel = document.querySelector("#account-panel");
const accountBack = document.querySelector("#account-back");
const accountStatus = document.querySelector("#account-status");
const accountSubmit = document.querySelector("#account-submit");
const otpHelp = document.querySelector("#otp-help");
const otpHelpText = document.querySelector("#otp-help-text");
const resendOtp = document.querySelector("#resend-otp");
const assessmentTitle = document.querySelector("#assessment-title");
const answerGrid = document.querySelector("#answer-grid");
const questionCategory = document.querySelector(".question-category");
const languageSelect = document.querySelector("#language-select");
const currentQuestionCount = document.querySelector("#current-question-count");
const questionNumber = document.querySelector("#question-number");
const assessmentProgress = document.querySelector("#assessment-progress");
const skipQuestion = document.querySelector("#skip-question");
const questionCard = document.querySelector("#question-card");
const analysisLoader = document.querySelector("#analysis-loader");
const completionCard = document.querySelector("#completion-card");
const restartAssessment = document.querySelector("#restart-assessment");
const confidenceVisual = document.querySelector(".confidence-visual");
const ageInput = document.querySelector("#age");
const ageError = document.querySelector("#age-error");
let currentQuestion = null;
let currentSession = null;
let analysisTimers = [];
let otpRequested = false;
let assessmentStorageMode = "one-time";
let encryptionPassphrase = "";

const AGE_ERROR_COPY = {
  en: ["Enter your age.", "Enter a whole number.", "This assessment is available only to people aged 18 or older.", "Enter an age between 18 and 120."],
  de: ["Gib dein Alter ein.", "Gib eine ganze Zahl ein.", "Diese Selbsteinschätzung ist nur für Personen ab 18 Jahren verfügbar.", "Gib ein Alter zwischen 18 und 120 Jahren ein."],
  pl: ["Podaj swój wiek.", "Podaj liczbę całkowitą.", "Ten autotest jest dostępny wyłącznie dla osób, które mają co najmniej 18 lat.", "Podaj wiek od 18 do 120 lat."],
  ru: ["Укажите свой возраст.", "Введите целое число.", "Этот самооценочный тест доступен только для лиц от 18 лет.", "Введите возраст от 18 до 120 лет."],
  es: ["Indica tu edad.", "Introduce un número entero.", "Esta autoevaluación está disponible solo para personas mayores de 18 años.", "Introduce una edad entre 18 y 120 años."],
  "zh-CN": ["请输入您的年龄。", "请输入整数。", "此自我评估仅面向年满 18 岁的人士。", "请输入 18 至 120 岁之间的年龄。"],
  ja: ["年齢を入力してください。", "整数を入力してください。", "この自己評価は18歳以上の方のみご利用いただけます。", "18歳から120歳までの年齢を入力してください。"],
  ko: ["나이를 입력해 주세요.", "정수를 입력해 주세요.", "이 자기 평가는 만 18세 이상만 이용할 수 있습니다.", "18세에서 120세 사이의 나이를 입력해 주세요."],
  pt: ["Indique a sua idade.", "Introduza um número inteiro.", "Esta autoavaliação está disponível apenas para pessoas com 18 anos ou mais.", "Introduza uma idade entre 18 e 120 anos."],
};

function validateAge() {
  const copy = AGE_ERROR_COPY[languageSelect.value] || AGE_ERROR_COPY.en;
  const rawValue = ageInput.value.trim();
  const age = Number(rawValue);
  let message = "";

  if (!rawValue) message = copy[0];
  else if (!Number.isInteger(age)) message = copy[1];
  else if (age < 18) message = copy[2];
  else if (age > 120) message = copy[3];

  ageInput.setCustomValidity(message);
  ageInput.setAttribute("aria-invalid", String(Boolean(message)));
  ageError.textContent = message;
  return !message;
}

ageInput.addEventListener("input", validateAge);
ageInput.addEventListener("blur", validateAge);

if (confidenceVisual && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let parallaxFrame = null;
  let parallaxX = 0;
  let parallaxY = 0;

  const updateCharacterParallax = () => {
    confidenceVisual.style.setProperty("--parallax-x", `${parallaxX}px`);
    confidenceVisual.style.setProperty("--parallax-y", `${parallaxY}px`);
    parallaxFrame = null;
  };

  confidenceVisual.addEventListener("pointermove", (event) => {
    const bounds = confidenceVisual.getBoundingClientRect();
    parallaxX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
    parallaxY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateCharacterParallax);
  });

  confidenceVisual.addEventListener("pointerleave", () => {
    parallaxX = 0;
    parallaxY = 0;
    if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateCharacterParallax);
  });
}

const SESSION_QUOTAS = {
  sexual_attraction: 8,
  romantic_attraction: 8,
  fantasy: 5,
  desire: 5,
  experience: 5,
  emotional_bond: 5,
  sexual_attraction_level: 3,
  romantic_attraction_level: 3,
  fluidity: 2,
  conditions: 2,
  self_understanding: 2,
  comfort_and_boundaries: 2,
};

const RESULT_COPY = {
  en: ["Preliminary profile", "Your attraction profile", "This result describes patterns in your answers. It does not define your identity or provide a diagnosis.", "Answer coverage", "Result stability", "Sexual relative position", "Romantic relative position", "Sexual attraction", "Romantic attraction", "Weighted scores prioritize attraction over fantasy and behavior. The shaded range is a heuristic uncertainty band, not a clinical confidence interval.", "Start a new assessment", "Not applicable", "answered items"],
  de: ["Vorläufiges Profil", "Dein Anziehungsprofil", "Dieses Ergebnis beschreibt Muster in deinen Antworten. Es definiert weder deine Identität noch stellt es eine Diagnose dar.", "Antwortabdeckung", "Ergebnisstabilität", "Relative sexuelle Position", "Relative romantische Position", "Sexuelle Anziehung", "Romantische Anziehung", "Gewichtete Werte priorisieren Anziehung vor Fantasie und Verhalten. Der schattierte Bereich ist ein heuristischer Unsicherheitsbereich, kein klinisches Konfidenzintervall.", "Neuen Test starten", "Nicht anwendbar", "beantwortete Fragen"],
  pl: ["Profil wstępny", "Twój profil pociągu", "Wynik opisuje wzorce w odpowiedziach. Nie definiuje Twojej tożsamości i nie jest diagnozą.", "Pokrycie odpowiedzi", "Stabilność wyniku", "Względna pozycja seksualna", "Względna pozycja romantyczna", "Pociąg seksualny", "Pociąg romantyczny", "Wynik ważony stawia pociąg ponad fantazjami i zachowaniem. Zacieniony zakres to heurystyczny przedział niepewności, a nie kliniczny przedział ufności.", "Rozpocznij nowy test", "Nie dotyczy", "odpowiedzi"],
  ru: ["Предварительный профиль", "Ваш профиль влечения", "Результат описывает закономерности в ответах. Он не определяет вашу идентичность и не является диагнозом.", "Полнота ответов", "Стабильность результата", "Относительная сексуальная позиция", "Относительная романтическая позиция", "Сексуальное влечение", "Романтическое влечение", "Взвешенные оценки отдают приоритет влечению, а не фантазиям и поведению. Затенённый диапазон — эвристическая неопределённость, а не клинический доверительный интервал.", "Начать новый тест", "Не применимо", "ответов"],
  es: ["Perfil preliminar", "Tu perfil de atracción", "El resultado describe patrones en tus respuestas. No define tu identidad ni constituye un diagnóstico.", "Cobertura de respuestas", "Estabilidad del resultado", "Posición sexual relativa", "Posición romántica relativa", "Atracción sexual", "Atracción romántica", "Las puntuaciones ponderadas priorizan la atracción sobre la fantasía y la conducta. El rango sombreado es una incertidumbre heurística, no un intervalo de confianza clínico.", "Iniciar una nueva evaluación", "No aplicable", "respuestas"],
  "zh-CN": ["初步画像", "您的吸引力画像", "该结果描述您的回答模式，不定义您的身份，也不是诊断。", "回答覆盖率", "结果稳定性", "相对性吸引位置", "相对浪漫吸引位置", "性吸引", "浪漫吸引", "加权分数优先考虑吸引，而非幻想和行为。阴影范围是启发式不确定区间，不是临床置信区间。", "开始新的测试", "不适用", "已回答项目"],
  ja: ["予備プロフィール", "あなたの魅力プロフィール", "結果は回答の傾向を示すもので、アイデンティティを定義したり診断したりするものではありません。", "回答率", "結果の安定性", "性的な相対位置", "恋愛的な相対位置", "性的魅力", "恋愛的魅力", "加重スコアは空想や行動より魅力を重視します。網掛け範囲はヒューリスティックな不確実性で、臨床的な信頼区間ではありません。", "新しいテストを開始", "該当なし", "回答項目"],
  ko: ["예비 프로필", "나의 끌림 프로필", "결과는 응답의 패턴을 설명하며 정체성을 규정하거나 진단하지 않습니다.", "응답 범위", "결과 안정성", "상대적 성적 위치", "상대적 로맨틱 위치", "성적 끌림", "로맨틱 끌림", "가중 점수는 환상이나 행동보다 끌림을 우선합니다. 음영 범위는 휴리스틱 불확실성으로 임상 신뢰구간이 아닙니다.", "새 테스트 시작", "해당 없음", "응답 항목"],
  pt: ["Perfil preliminar", "O seu perfil de atração", "O resultado descreve padrões nas respostas. Não define a sua identidade nem constitui um diagnóstico.", "Cobertura das respostas", "Estabilidade do resultado", "Posição sexual relativa", "Posição romântica relativa", "Atração sexual", "Atração romântica", "As pontuações ponderadas priorizam a atração em relação à fantasia e ao comportamento. A faixa sombreada é uma incerteza heurística, não um intervalo de confiança clínico.", "Iniciar uma nova avaliação", "Não aplicável", "respostas"],
};

const LOADER_COPY = {
  en: ["Analyzing your responses", "Building your multidimensional profile…", "Balancing attraction axes", "Estimating uncertainty", "Preparing your result"],
  de: ["Antworten werden analysiert", "Dein mehrdimensionales Profil wird erstellt…", "Anziehungsachsen ausgleichen", "Unsicherheit schätzen", "Ergebnis vorbereiten"],
  pl: ["Analizujemy odpowiedzi", "Tworzymy Twój wielowymiarowy profil…", "Równoważenie osi pociągu", "Szacowanie niepewności", "Przygotowywanie wyniku"],
  ru: ["Анализируем ответы", "Создаём многомерный профиль…", "Балансируем оси влечения", "Оцениваем неопределённость", "Готовим результат"],
  es: ["Analizando tus respuestas", "Creando tu perfil multidimensional…", "Equilibrando ejes de atracción", "Estimando la incertidumbre", "Preparando el resultado"],
  "zh-CN": ["正在分析您的回答", "正在构建多维画像…", "平衡吸引力轴", "估算不确定性", "准备结果"],
  ja: ["回答を分析しています", "多次元プロフィールを作成しています…", "魅力軸を調整", "不確実性を推定", "結果を準備"],
  ko: ["응답 분석 중", "다차원 프로필을 구성하고 있습니다…", "끌림 축 균형 조정", "불확실성 추정", "결과 준비"],
  pt: ["A analisar as respostas", "A criar o seu perfil multidimensional…", "A equilibrar eixos de atração", "A estimar a incerteza", "A preparar o resultado"],
};

const CANCEL_COPY = {
  en: ["Cancel assessment", "Cancel this assessment? Your current questions and answers will be permanently removed from this device."],
  de: ["Test abbrechen", "Diesen Test abbrechen? Die aktuellen Fragen und Antworten werden dauerhaft von diesem Gerät gelöscht."],
  pl: ["Anuluj test", "Anulować ten test? Bieżące pytania i odpowiedzi zostaną trwale usunięte z tego urządzenia."],
  ru: ["Отменить тест", "Отменить этот тест? Текущие вопросы и ответы будут навсегда удалены с этого устройства."],
  es: ["Cancelar evaluación", "¿Cancelar esta evaluación? Las preguntas y respuestas actuales se eliminarán permanentemente de este dispositivo."],
  "zh-CN": ["取消测试", "要取消此测试吗？当前问题和回答将从此设备中永久删除。"],
  ja: ["テストを中止", "このテストを中止しますか？現在の質問と回答はこの端末から完全に削除されます。"],
  ko: ["테스트 취소", "이 테스트를 취소할까요? 현재 질문과 응답이 이 기기에서 영구적으로 삭제됩니다."],
  pt: ["Cancelar avaliação", "Cancelar esta avaliação? As perguntas e respostas atuais serão eliminadas permanentemente deste dispositivo."],
};

const ACCOUNT_COPY = {
  en: ["Back", "Sign in", "Create account", "Email", "Account password", "Private encryption passphrase", "This passphrase encrypts your results on this device and is never sent to Supabase. If you lose it, your encrypted results cannot be recovered.", "Sign in and continue", "Create account and continue"],
  de: ["Zurück", "Anmelden", "Konto erstellen", "E-Mail", "Kontopasswort", "Privates Verschlüsselungspasswort", "Dieses Passwort verschlüsselt deine Ergebnisse auf diesem Gerät und wird nie an Supabase gesendet. Bei Verlust können die Daten nicht wiederhergestellt werden.", "Anmelden und fortfahren", "Konto erstellen und fortfahren"],
  pl: ["Wstecz", "Zaloguj się", "Utwórz konto", "E-mail", "Hasło konta", "Prywatne hasło szyfrujące", "To hasło szyfruje wyniki na tym urządzeniu i nigdy nie jest wysyłane do Supabase. Jeśli je utracisz, zaszyfrowanych wyników nie będzie można odzyskać.", "Zaloguj się i kontynuuj", "Utwórz konto i kontynuuj"],
  ru: ["Назад", "Войти", "Создать аккаунт", "Эл. почта", "Пароль аккаунта", "Личная фраза шифрования", "Эта фраза шифрует результаты на устройстве и никогда не отправляется в Supabase. При её утрате результаты нельзя восстановить.", "Войти и продолжить", "Создать аккаунт и продолжить"],
  es: ["Atrás", "Iniciar sesión", "Crear cuenta", "Correo electrónico", "Contraseña de la cuenta", "Frase privada de cifrado", "Esta frase cifra tus resultados en el dispositivo y nunca se envía a Supabase. Si la pierdes, no será posible recuperar los resultados.", "Iniciar sesión y continuar", "Crear cuenta y continuar"],
  "zh-CN": ["返回", "登录", "创建账户", "电子邮件", "账户密码", "私人加密口令", "此口令在设备上加密您的结果，绝不会发送到 Supabase。若丢失，将无法恢复加密结果。", "登录并继续", "创建账户并继续"],
  ja: ["戻る", "ログイン", "アカウント作成", "メール", "アカウントパスワード", "秘密の暗号化パスフレーズ", "このパスフレーズは端末上で結果を暗号化し、Supabaseには送信されません。紛失すると結果を復元できません。", "ログインして続行", "アカウントを作成して続行"],
  ko: ["뒤로", "로그인", "계정 만들기", "이메일", "계정 비밀번호", "개인 암호화 문구", "이 문구는 기기에서 결과를 암호화하며 Supabase로 전송되지 않습니다. 분실하면 결과를 복구할 수 없습니다.", "로그인하고 계속", "계정을 만들고 계속"],
  pt: ["Voltar", "Iniciar sessão", "Criar conta", "E-mail", "Palavra-passe da conta", "Frase privada de encriptação", "Esta frase encripta os resultados no dispositivo e nunca é enviada ao Supabase. Se a perder, os resultados não poderão ser recuperados.", "Iniciar sessão e continuar", "Criar conta e continuar"],
};

const OTP_COPY = {
  en: ["Back", "Email", "Private encryption passphrase", "This passphrase encrypts your results on this device and is never sent to Supabase. If you lose it, your encrypted results cannot be recovered.", "Send verification code", "Verification code", "Verify and continue", "Sending code…", "A verification code was sent to your email.", "Verifying code…"],
  de: ["Zurück", "E-Mail", "Privates Verschlüsselungspasswort", "Dieses Passwort verschlüsselt deine Ergebnisse auf diesem Gerät und wird nie an Supabase gesendet. Bei Verlust können die Daten nicht wiederhergestellt werden.", "Bestätigungscode senden", "Bestätigungscode", "Bestätigen und fortfahren", "Code wird gesendet…", "Ein Bestätigungscode wurde per E-Mail gesendet.", "Code wird geprüft…"],
  pl: ["Wstecz", "E-mail", "Prywatne hasło szyfrujące", "To hasło szyfruje wyniki na tym urządzeniu i nigdy nie jest wysyłane do Supabase. Jeśli je utracisz, wyników nie będzie można odzyskać.", "Wyślij kod weryfikacyjny", "Kod weryfikacyjny", "Zweryfikuj i kontynuuj", "Wysyłanie kodu…", "Kod weryfikacyjny został wysłany na Twój e-mail.", "Weryfikowanie kodu…"],
  ru: ["Назад", "Эл. почта", "Личная фраза шифрования", "Эта фраза шифрует результаты на устройстве и никогда не отправляется в Supabase. При её утрате результаты нельзя восстановить.", "Отправить код", "Код подтверждения", "Подтвердить и продолжить", "Отправка кода…", "Код подтверждения отправлен на вашу почту.", "Проверка кода…"],
  es: ["Atrás", "Correo electrónico", "Frase privada de cifrado", "Esta frase cifra los resultados en el dispositivo y nunca se envía a Supabase. Si la pierdes, no será posible recuperarlos.", "Enviar código", "Código de verificación", "Verificar y continuar", "Enviando código…", "El código fue enviado a tu correo.", "Verificando código…"],
  "zh-CN": ["返回", "电子邮件", "私人加密口令", "此口令在设备上加密您的结果，绝不会发送到 Supabase。若丢失，将无法恢复结果。", "发送验证码", "验证码", "验证并继续", "正在发送验证码…", "验证码已发送到您的邮箱。", "正在验证…"],
  ja: ["戻る", "メール", "秘密の暗号化パスフレーズ", "このパスフレーズは端末上で結果を暗号化し、Supabaseには送信されません。紛失すると結果を復元できません。", "確認コードを送信", "確認コード", "確認して続行", "コードを送信中…", "確認コードをメールで送信しました。", "コードを確認中…"],
  ko: ["뒤로", "이메일", "개인 암호화 문구", "이 문구는 기기에서 결과를 암호화하며 Supabase로 전송되지 않습니다. 분실하면 결과를 복구할 수 없습니다.", "인증 코드 보내기", "인증 코드", "인증하고 계속", "코드 전송 중…", "이메일로 인증 코드를 보냈습니다.", "코드 확인 중…"],
  pt: ["Voltar", "E-mail", "Frase privada de encriptação", "Esta frase encripta os resultados no dispositivo e nunca é enviada ao Supabase. Se a perder, os resultados não poderão ser recuperados.", "Enviar código", "Código de verificação", "Verificar e continuar", "A enviar código…", "O código foi enviado para o seu e-mail.", "A verificar código…"],
};

const OTP_RESEND_COPY = {
  en: ["Didn't receive the code?", "Send it again", "Sending again…", "A new verification code was sent."],
  de: ["Code nicht erhalten?", "Erneut senden", "Erneut senden…", "Ein neuer Bestätigungscode wurde gesendet."],
  pl: ["Kod nie dotarł?", "Wyślij ponownie", "Ponowne wysyłanie…", "Nowy kod weryfikacyjny został wysłany."],
  ru: ["Код не пришёл?", "Отправить ещё раз", "Повторная отправка…", "Новый код подтверждения отправлен."],
  es: ["¿No recibiste el código?", "Enviar de nuevo", "Enviando de nuevo…", "Se envió un nuevo código de verificación."],
  "zh-CN": ["没有收到验证码？", "重新发送", "正在重新发送…", "新的验证码已发送。"],
  ja: ["コードが届きませんか？", "再送信", "再送信中…", "新しい確認コードを送信しました。"],
  ko: ["코드를 받지 못했나요?", "다시 보내기", "다시 보내는 중…", "새 인증 코드를 보냈습니다."],
  pt: ["Não recebeu o código?", "Enviar novamente", "A reenviar…", "Foi enviado um novo código de verificação."],
};

const METRIC_LABELS = {
  en: ["Additional dimensions", "Sexual attraction presence", "Romantic attraction presence", "Fluidity over time", "Bond/context dependence", "Self-understanding", "Identity complexity", "Boundaries and comfort"],
  de: ["Weitere Dimensionen", "Vorhandensein sexueller Anziehung", "Vorhandensein romantischer Anziehung", "Veränderung im Zeitverlauf", "Bindungs-/Kontextabhängigkeit", "Selbstverständnis", "Identitätskomplexität", "Grenzen und Wohlbefinden"],
  pl: ["Dodatkowe wymiary", "Obecność pociągu seksualnego", "Obecność pociągu romantycznego", "Zmienność w czasie", "Zależność od więzi i kontekstu", "Samoświadomość", "Złożoność tożsamości", "Granice i komfort"],
  ru: ["Дополнительные измерения", "Наличие сексуального влечения", "Наличие романтического влечения", "Изменчивость во времени", "Зависимость от связи и контекста", "Самопонимание", "Сложность идентичности", "Границы и комфорт"],
  es: ["Dimensiones adicionales", "Presencia de atracción sexual", "Presencia de atracción romántica", "Fluidez temporal", "Dependencia del vínculo y contexto", "Autoconocimiento", "Complejidad de identidad", "Límites y comodidad"],
  "zh-CN": ["其他维度", "性吸引存在程度", "浪漫吸引存在程度", "随时间的流动性", "对联结与情境的依赖", "自我理解", "身份复杂度", "界限与舒适度"],
  ja: ["追加の次元", "性的魅力の存在", "恋愛的魅力の存在", "時間的な流動性", "絆・状況への依存", "自己理解", "アイデンティティの複雑性", "境界線と安心感"],
  ko: ["추가 차원", "성적 끌림의 존재", "로맨틱 끌림의 존재", "시간에 따른 유동성", "유대·맥락 의존성", "자기 이해", "정체성 복잡성", "경계와 편안함"],
  pt: ["Dimensões adicionais", "Presença de atração sexual", "Presença de atração romântica", "Fluidez ao longo do tempo", "Dependência de vínculo e contexto", "Autoconhecimento", "Complexidade da identidade", "Limites e conforto"],
};

const INDEX_CONFIG = {
  sexualPresence: { positive: [187, 194, 199, 201, 204], reverse: [188, 189, 190, 191, 192, 193, 195, 196, 197, 198, 200, 202, 203, 205, 206] },
  romanticPresence: { positive: [207, 210, 213, 214, 217, 219, 220, 222, 223], reverse: [208, 209, 211, 212, 215, 216, 218, 221, 224] },
  fluidity: { positive: [225, 226, 227, 228, 229, 230, 231, 232, 234, 235, 236, 237, 238, 239, 240, 241, 242, 244], reverse: [233, 243] },
  contextDependence: { positive: [245, 246, 247, 248, 249, 250, 251, 254, 255, 257, 258, 259, 260, 261, 262, 263], reverse: [252, 253, 256, 264] },
  selfUnderstanding: { positive: [265, 266, 272, 274, 275, 276, 277, 279, 280, 281, 282], reverse: [271, 273, 278] },
  identityComplexity: { positive: [267, 269], reverse: [268, 270] },
  boundaries: { positive: [283, 284, 285, 286, 287, 288, 289, 291, 293, 294, 295, 296, 297, 298, 299, 300], reverse: [290, 292] },
};

const GENDER_LABELS = {
  en: ["Select an option", "Woman", "Man", "Non-binary", "Genderfluid", "Agender", "Another identity", "Prefer not to say"],
  de: ["Option auswählen", "Frau", "Mann", "Nicht-binär", "Genderfluid", "Agender", "Andere Identität", "Keine Angabe"],
  pl: ["Wybierz opcję", "Kobieta", "Mężczyzna", "Osoba niebinarna", "Osoba genderfluid", "Osoba agender", "Inna tożsamość", "Wolę nie odpowiadać"],
  ru: ["Выберите вариант", "Женщина", "Мужчина", "Небинарная личность", "Гендерфлюид", "Агендер", "Другая идентичность", "Предпочитаю не отвечать"],
  es: ["Selecciona una opción", "Mujer", "Hombre", "No binario", "Género fluido", "Agénero", "Otra identidad", "Prefiero no responder"],
  "zh-CN": ["选择一个选项", "女性", "男性", "非二元性别", "流动性别", "无性别", "其他性别认同", "不愿透露"],
  ja: ["選択してください", "女性", "男性", "ノンバイナリー", "ジェンダーフルイド", "アジェンダー", "その他の性自認", "回答しない"],
  ko: ["옵션 선택", "여성", "남성", "논바이너리", "젠더플루이드", "에이젠더", "다른 성 정체성", "응답하지 않음"],
  pt: ["Selecione uma opção", "Mulher", "Homem", "Não binário", "Gênero fluido", "Agênero", "Outra identidade", "Prefiro não responder"],
};

const CATEGORY_LABELS = {
  en: { sexual_attraction: "Sexual attraction", romantic_attraction: "Romantic attraction", fantasy: "Fantasy", desire: "Desire", experience: "Experience", emotional_bond: "Emotional bond", sexual_attraction_level: "Attraction level", romantic_attraction_level: "Romantic attraction", fluidity: "Fluidity", conditions: "Context", self_understanding: "Self-understanding", comfort_and_boundaries: "Comfort & boundaries" },
  de: { sexual_attraction: "Sexuelle Anziehung", romantic_attraction: "Romantische Anziehung", fantasy: "Fantasie", desire: "Verlangen", experience: "Erfahrung", emotional_bond: "Emotionale Bindung", sexual_attraction_level: "Anziehungsstärke", romantic_attraction_level: "Romantische Anziehung", fluidity: "Veränderlichkeit", conditions: "Kontext", self_understanding: "Selbstverständnis", comfort_and_boundaries: "Wohlbefinden & Grenzen" },
  pl: { sexual_attraction: "Pociąg seksualny", romantic_attraction: "Pociąg romantyczny", fantasy: "Fantazje", desire: "Pragnienie", experience: "Doświadczenie", emotional_bond: "Więź emocjonalna", sexual_attraction_level: "Poziom pociągu", romantic_attraction_level: "Pociąg romantyczny", fluidity: "Zmienność", conditions: "Kontekst", self_understanding: "Samoświadomość", comfort_and_boundaries: "Komfort i granice" },
  ru: { sexual_attraction: "Сексуальное влечение", romantic_attraction: "Романтическое влечение", fantasy: "Фантазии", desire: "Желание", experience: "Опыт", emotional_bond: "Эмоциональная связь", sexual_attraction_level: "Уровень влечения", romantic_attraction_level: "Романтическое влечение", fluidity: "Изменчивость", conditions: "Контекст", self_understanding: "Самопонимание", comfort_and_boundaries: "Комфорт и границы" },
  es: { sexual_attraction: "Atracción sexual", romantic_attraction: "Atracción romántica", fantasy: "Fantasía", desire: "Deseo", experience: "Experiencia", emotional_bond: "Vínculo emocional", sexual_attraction_level: "Nivel de atracción", romantic_attraction_level: "Atracción romántica", fluidity: "Fluidez", conditions: "Contexto", self_understanding: "Autoconocimiento", comfort_and_boundaries: "Comodidad y límites" },
  "zh-CN": { sexual_attraction: "性吸引", romantic_attraction: "浪漫吸引", fantasy: "幻想", desire: "欲望", experience: "经历", emotional_bond: "情感联结", sexual_attraction_level: "吸引程度", romantic_attraction_level: "浪漫吸引", fluidity: "流动性", conditions: "情境", self_understanding: "自我理解", comfort_and_boundaries: "舒适与界限" },
  ja: { sexual_attraction: "性的魅力", romantic_attraction: "恋愛的魅力", fantasy: "ファンタジー", desire: "欲求", experience: "経験", emotional_bond: "感情的な絆", sexual_attraction_level: "魅力の程度", romantic_attraction_level: "恋愛的魅力", fluidity: "流動性", conditions: "状況", self_understanding: "自己理解", comfort_and_boundaries: "安心感と境界線" },
  ko: { sexual_attraction: "성적 끌림", romantic_attraction: "로맨틱 끌림", fantasy: "환상", desire: "욕구", experience: "경험", emotional_bond: "정서적 유대", sexual_attraction_level: "끌림의 정도", romantic_attraction_level: "로맨틱 끌림", fluidity: "유동성", conditions: "맥락", self_understanding: "자기 이해", comfort_and_boundaries: "편안함과 경계" },
  pt: { sexual_attraction: "Atração sexual", romantic_attraction: "Atração romântica", fantasy: "Fantasia", desire: "Desejo", experience: "Experiência", emotional_bond: "Vínculo emocional", sexual_attraction_level: "Nível de atração", romantic_attraction_level: "Atração romântica", fluidity: "Fluidez", conditions: "Contexto", self_understanding: "Autoconhecimento", comfort_and_boundaries: "Conforto e limites" },
};

const savedTheme = localStorage.getItem("whereOnKinsey.theme") || "dark";
document.documentElement.dataset.theme = savedTheme;
updateThemeButton(savedTheme);

const savedLanguage = localStorage.getItem("whereOnKinsey.language") || "en";
applyLanguage(savedLanguage);
languageSelect.addEventListener("change", () => applyLanguage(languageSelect.value));

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("whereOnKinsey.theme", nextTheme);
  updateThemeButton(nextTheme);
});

function updateThemeButton(theme) {
  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.querySelector("span").textContent = isDark ? "☀" : "☾";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateAge()) {
    ageInput.focus();
    return;
  }
  if (!form.reportValidity()) return;

  const profile = Object.fromEntries(new FormData(form).entries());
  profile.adultConsent = true;
  profile.savedAt = new Date().toISOString();

  localStorage.setItem("whereOnKinsey.profile", JSON.stringify(profile));
  accessDialog.showModal();
});

continueOneTime.addEventListener("click", () => {
  assessmentStorageMode = "one-time";
  encryptionPassphrase = "";
  accessDialog.close();
  if (!resumeAssessment()) startAssessment();
  section1.hidden = true;
  assessmentSection.hidden = false;
  assessmentSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

continueAccount.addEventListener("click", () => {
  resetOtpFlow();
  dialogOptions.hidden = true;
  accountPanel.hidden = false;
  accountStatus.textContent = "";
});

accountBack.addEventListener("click", () => {
  resetOtpFlow();
  accountPanel.hidden = true;
  dialogOptions.hidden = false;
  accountStatus.textContent = "";
});

async function requestEmailOtp(email) {
  const client = window.WOKSupabase?.client;
  if (!client) throw new Error("Unable to load the account service. Check your internet connection.");
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

accountPanel.addEventListener("submit", async (event) => {
  event.preventDefault();
  const client = window.WOKSupabase?.client;
  if (!client) {
    accountStatus.textContent = "Unable to load the account service. Check your internet connection.";
    return;
  }
  const email = document.querySelector("#account-email").value.trim();
  const passphrase = document.querySelector("#encryption-passphrase").value;
  const copy = OTP_COPY[languageSelect.value] || OTP_COPY.en;
  accountSubmit.disabled = true;
  accountStatus.textContent = otpRequested ? copy[9] : copy[7];

  if (!otpRequested) {
    try {
      await requestEmailOtp(email);
    } catch (error) {
      accountSubmit.disabled = false;
      accountStatus.textContent = error.message || "The verification code could not be sent.";
      return;
    }
    accountSubmit.disabled = false;
    otpRequested = true;
    document.querySelector("#otp-code-field").hidden = false;
    document.querySelector("#otp-code").required = true;
    document.querySelector("#account-email").readOnly = true;
    document.querySelector("#encryption-passphrase").readOnly = true;
    otpHelp.hidden = false;
    accountStatus.textContent = copy[8];
    updateAccountSubmitLabel();
    document.querySelector("#otp-code").focus();
    return;
  }

  const token = document.querySelector("#otp-code").value.replace(/\s/g, "");
  let response;
  try {
    response = await client.auth.verifyOtp({ email, token, type: "email" });
  } catch (error) {
    accountSubmit.disabled = false;
    accountStatus.textContent = error.message || "The code could not be verified.";
    return;
  }
  accountSubmit.disabled = false;
  if (response.error) {
    accountStatus.textContent = response.error.message;
    return;
  }
  if (!response.data.session) {
    accountStatus.textContent = "The code was accepted, but no session was created. Request a new code and try again.";
    return;
  }
  assessmentStorageMode = "account";
  encryptionPassphrase = passphrase;
  accessDialog.close();
  if (!resumeAssessment()) startAssessment();
  section1.hidden = true;
  assessmentSection.hidden = false;
  assessmentSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

resendOtp.addEventListener("click", async () => {
  const email = document.querySelector("#account-email").value.trim();
  const copy = OTP_RESEND_COPY[languageSelect.value] || OTP_RESEND_COPY.en;
  resendOtp.disabled = true;
  resendOtp.textContent = copy[2];
  accountStatus.textContent = "";
  try {
    await requestEmailOtp(email);
    accountStatus.textContent = copy[3];
    document.querySelector("#otp-code").value = "";
    document.querySelector("#otp-code").focus();
  } catch (error) {
    accountStatus.textContent = error.message || "The verification code could not be sent again.";
  } finally {
    resendOtp.disabled = false;
    resendOtp.textContent = copy[1];
  }
});

closeAccessDialog.addEventListener("click", () => {
  accessDialog.close();
  resetOtpFlow();
  accountPanel.hidden = true;
  dialogOptions.hidden = false;
});

function startAssessment() {
  const bank = window.WhereOnKinseyQuestionBank;
  const selected = [];
  const profile = readProfile();
  const targetOrder = getTargetOrder(profile.gender);

  Object.entries(SESSION_QUOTAS).forEach(([dimension, quota]) => {
    const candidates = bank.filter((question) => question.dimension === dimension);
    const availableTargets = candidates.some((question) => question.target !== "none") ? targetOrder : ["none"];
    const targetBuckets = availableTargets.map((target) => shuffle(candidates.filter((question) => question.target === target)));
    let cursor = 0;
    while (selected.filter((question) => question.dimension === dimension).length < quota) {
      const bucket = targetBuckets[cursor % targetBuckets.length];
      const candidate = bucket.shift();
      if (candidate) selected.push(candidate);
      cursor++;
      if (cursor > candidates.length * 5) break;
    }
  });

  const questions = shuffle(selected);
  currentSession = {
    version: 1,
    questionIds: questions.map((question) => question.id),
    answers: {},
    currentIndex: 0,
    profileGender: profile.gender || "private",
    targetOrder,
    storageMode: assessmentStorageMode,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
  saveSession();
  showCurrentQuestion();
}

function resumeAssessment() {
  try {
    const saved = JSON.parse(localStorage.getItem("whereOnKinsey.session"));
    const profileGender = readProfile().gender || "private";
    const validIds = new Set(window.WhereOnKinseyQuestionBank.map((question) => question.id));
    const isValid = saved
      && Array.isArray(saved.questionIds)
      && saved.questionIds.length === 50
      && saved.questionIds.every((id) => validIds.has(id))
      && Number.isInteger(saved.currentIndex)
      && saved.currentIndex >= 0
      && saved.currentIndex < 50
      && saved.profileGender === profileGender
      && (saved.storageMode || "one-time") === assessmentStorageMode
      && !saved.completedAt;
    if (!isValid) return false;
    currentSession = saved;
    questionCard.hidden = false;
    completionCard.hidden = true;
    showCurrentQuestion();
    return true;
  } catch {
    return false;
  }
}

function renderQuestion(question) {
  currentQuestion = question;
  const language = languageSelect.value;
  const locale = window.WhereOnKinseyLocales[language] || window.WhereOnKinseyLocales.en;
  const profileGender = currentSession?.profileGender || readProfile().gender || "private";
  assessmentTitle.textContent = genderizeQuestion(locale.questions[question.id] || question.text, language, profileGender);
  questionCategory.textContent = CATEGORY_LABELS[language]?.[question.dimension] || CATEGORY_LABELS.en[question.dimension] || question.dimension.replaceAll("_", " ");
  answerGrid.replaceChildren(...locale.answerScales[question.scale].map((label, value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.value = value;
    button.textContent = label;
    return button;
  }));
}

function showCurrentQuestion() {
  if (!currentSession || currentSession.currentIndex >= currentSession.questionIds.length) {
    completeAssessment();
    return;
  }

  const id = currentSession.questionIds[currentSession.currentIndex];
  const question = window.WhereOnKinseyQuestionBank.find((item) => item.id === id);
  if (!question) {
    startAssessment();
    return;
  }
  const position = currentSession.currentIndex + 1;
  currentQuestionCount.textContent = position;
  questionNumber.textContent = String(position).padStart(2, "0");
  assessmentProgress.style.width = `${(position / 50) * 100}%`;
  assessmentProgress.parentElement.setAttribute("aria-label", `Assessment progress: question ${position} of 50`);
  renderQuestion(question);
}

answerGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-value]");
  if (!button || !currentQuestion || !currentSession) return;
  answerGrid.querySelectorAll("button").forEach((item) => { item.disabled = true; });
  button.classList.add("selected");
  recordAnswer({ value: Number(button.dataset.value), skipped: false });
  window.setTimeout(advanceQuestion, 260);
});

skipQuestion.addEventListener("click", () => {
  if (!currentQuestion || !currentSession) return;
  recordAnswer({ value: null, skipped: true });
  advanceQuestion();
});

restartAssessment.addEventListener("click", () => {
  clearAnalysisTimers();
  questionCard.hidden = false;
  analysisLoader.hidden = true;
  completionCard.hidden = true;
  startAssessment();
});

function recordAnswer(answer) {
  currentSession.answers[currentQuestion.id] = {
    ...answer,
    scale: currentQuestion.scale,
    dimension: currentQuestion.dimension,
    target: currentQuestion.target,
    targetRelation: getTargetRelation(currentSession.profileGender, currentQuestion.target),
    profileGender: currentSession.profileGender,
    answeredAt: new Date().toISOString(),
  };
  saveSession();
}

function advanceQuestion() {
  currentSession.currentIndex += 1;
  saveSession();
  showCurrentQuestion();
}

function completeAssessment() {
  currentSession.completedAt = new Date().toISOString();
  currentSession.currentIndex = 50;
  currentSession.analysis = analyzeSession(currentSession);
  saveSession();
  if (currentSession.storageMode === "account" && encryptionPassphrase) syncEncryptedSession();
  currentQuestion = null;
  assessmentProgress.style.width = "100%";
  questionCard.hidden = true;
  completionCard.hidden = true;
  analysisLoader.hidden = false;
  applyLoaderCopy(languageSelect.value);
  runAnalysisAnimation();
}

async function syncEncryptedSession() {
  try {
    currentSession.cloudSync = { status: "encrypting", updatedAt: new Date().toISOString() };
    saveSession();
    const record = await window.WOKSupabase.saveEncryptedAssessment(currentSession, encryptionPassphrase);
    currentSession.cloudSync = { status: "saved", recordId: record.id, savedAt: record.created_at };
    saveSession();
  } catch (error) {
    currentSession.cloudSync = { status: "error", message: error.message, updatedAt: new Date().toISOString() };
    saveSession();
    toast.textContent = `Encrypted cloud save failed: ${error.message}`;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 5000);
  }
}

function updateAccountSubmitLabel() {
  const copy = OTP_COPY[languageSelect.value] || OTP_COPY.en;
  accountSubmit.querySelector("span").textContent = otpRequested ? copy[6] : copy[4];
}

function applyAccountCopy(language) {
  const copy = OTP_COPY[language] || OTP_COPY.en;
  const resendCopy = OTP_RESEND_COPY[language] || OTP_RESEND_COPY.en;
  accountBack.querySelector("span").textContent = copy[0];
  document.querySelector("#account-email-label").textContent = copy[1];
  document.querySelector("#passphrase-label").textContent = copy[2];
  document.querySelector("#encryption-note").textContent = copy[3];
  document.querySelector("#otp-code-label").textContent = copy[5];
  otpHelpText.textContent = resendCopy[0];
  resendOtp.textContent = resendCopy[1];
  updateAccountSubmitLabel();
}

function resetOtpFlow() {
  otpRequested = false;
  const code = document.querySelector("#otp-code");
  code.value = "";
  code.required = false;
  document.querySelector("#otp-code-field").hidden = true;
  otpHelp.hidden = true;
  resendOtp.disabled = false;
  document.querySelector("#account-email").readOnly = false;
  document.querySelector("#encryption-passphrase").readOnly = false;
  updateAccountSubmitLabel();
}

function runAnalysisAnimation() {
  clearAnalysisTimers();
  const steps = [...document.querySelectorAll(".loader-steps span")];
  steps.forEach((step, index) => step.classList.toggle("active", index === 0));
  analysisTimers.push(window.setTimeout(() => steps[1]?.classList.add("active"), 650));
  analysisTimers.push(window.setTimeout(() => steps[2]?.classList.add("active"), 1300));
  analysisTimers.push(window.setTimeout(() => {
    analysisLoader.hidden = true;
    completionCard.hidden = false;
    applyCompletionCopy(languageSelect.value);
    renderAnalysis(currentSession.analysis, languageSelect.value);
    completionCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 1950));
}

function clearAnalysisTimers() {
  analysisTimers.forEach((timer) => window.clearTimeout(timer));
  analysisTimers = [];
}

function saveSession() {
  localStorage.setItem("whereOnKinsey.session", JSON.stringify(currentSession));
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    const swapIndex = Math.floor(random * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem("whereOnKinsey.profile")) || {};
  } catch {
    return {};
  }
}

function getTargetOrder(gender) {
  if (gender === "woman") return ["women", "men", "nonbinary"];
  if (gender === "man") return ["men", "women", "nonbinary"];
  if (["nonbinary", "genderfluid", "agender", "another"].includes(gender)) return ["nonbinary", "women", "men"];
  return shuffle(["women", "men", "nonbinary"]);
}

function getTargetRelation(gender, target) {
  if (target === "none") return "not_applicable";
  if (gender === "woman") {
    if (target === "women") return "same_gender";
    if (target === "men") return "different_gender";
    return "nonbinary_context";
  }
  if (gender === "man") {
    if (target === "men") return "same_gender";
    if (target === "women") return "different_gender";
    return "nonbinary_context";
  }
  if (gender === "nonbinary" && target === "nonbinary") return "nonbinary_context";
  return "unclassified";
}

function analyzeSession(session) {
  const answers = Object.entries(session.answers)
    .map(([id, answer]) => ({ ...answer, id }))
    .filter((answer) => !answer.skipped && Number.isFinite(answer.value));
  const targets = ["women", "men", "nonbinary"];
  const sexualWeights = { sexual_attraction: 1, desire: 0.8, fantasy: 0.65 };
  const romanticWeights = { romantic_attraction: 1, emotional_bond: 0.8 };

  const sexual = Object.fromEntries(targets.map((target) => [target, calculateWeightedAxis(answers, target, sexualWeights)]));
  const romantic = Object.fromEntries(targets.map((target) => [target, calculateWeightedAxis(answers, target, romanticWeights)]));
  const componentDimensions = ["sexual_attraction", "romantic_attraction", "fantasy", "desire", "experience", "emotional_bond"];
  const components = Object.fromEntries(componentDimensions.map((dimension) => [
    dimension,
    Object.fromEntries(targets.map((target) => [target, calculateWeightedAxis(answers, target, { [dimension]: 1 })])),
  ]));
  const indices = Object.fromEntries(Object.entries(INDEX_CONFIG).map(([name, config]) => [name, calculateCodedIndex(answers, config)]));
  const allAxes = [...Object.values(sexual), ...Object.values(romantic)];
  const coverage = answers.length / 50;
  const adequateAxes = allAxes.filter((axis) => axis.n >= 3).length / allAxes.length;
  const meanUncertainty = allAxes.reduce((sum, axis) => sum + axis.margin, 0) / allAxes.length;
  const consistency = Math.max(0, 1 - meanUncertainty / 0.35);
  const stability = clamp(coverage * 0.45 + adequateAxes * 0.3 + consistency * 0.25, 0, 1);

  return {
    algorithm: "wok-profile-1.0",
    calculatedAt: new Date().toISOString(),
    profileGender: session.profileGender,
    answered: answers.length,
    skipped: 50 - answers.length,
    coverage: round(coverage, 4),
    stability: round(stability, 4),
    sexual,
    romantic,
    components,
    indices,
    scoring: {
      sexualWeights,
      romanticWeights,
      reverseCodedItems: Object.fromEntries(Object.entries(INDEX_CONFIG).map(([name, config]) => [name, config.reverse.map(toQuestionId)])),
    },
    kinseyStyle: {
      sexual: calculateRelativePosition(sexual, session.profileGender),
      romantic: calculateRelativePosition(romantic, session.profileGender),
    },
  };
}

function calculateCodedIndex(answers, config) {
  const positive = new Set(config.positive.map(toQuestionId));
  const reverse = new Set(config.reverse.map(toQuestionId));
  const rows = answers
    .filter((answer) => positive.has(answer.id) || reverse.has(answer.id))
    .map((answer) => ({ score: reverse.has(answer.id) ? 1 - answer.value / 4 : answer.value / 4, weight: 1 }));
  return summarizeRows(rows);
}

function calculateWeightedAxis(answers, target, weights) {
  const rows = answers
    .filter((answer) => answer.target === target && weights[answer.dimension])
    .map((answer) => ({ score: clamp(answer.value / 4, 0, 1), weight: weights[answer.dimension] }));

  return summarizeRows(rows);
}

function summarizeRows(rows) {
  if (!rows.length) return { score: 0, low: 0, high: 1, margin: 0.5, n: 0, effectiveN: 0 };
  const weightSum = rows.reduce((sum, row) => sum + row.weight, 0);
  const score = rows.reduce((sum, row) => sum + row.score * row.weight, 0) / weightSum;
  const variance = rows.reduce((sum, row) => sum + row.weight * ((row.score - score) ** 2), 0) / weightSum;
  const squaredWeightSum = rows.reduce((sum, row) => sum + row.weight ** 2, 0);
  const effectiveN = (weightSum ** 2) / squaredWeightSum;
  const margin = Math.min(0.35, 1.64 * Math.sqrt(variance / Math.max(effectiveN, 1)) + 0.18 / Math.sqrt(rows.length));
  return {
    score: round(score, 4),
    low: round(clamp(score - margin, 0, 1), 4),
    high: round(clamp(score + margin, 0, 1), 4),
    margin: round(margin, 4),
    n: rows.length,
    effectiveN: round(effectiveN, 3),
  };
}

function toQuestionId(number) {
  return `q${String(number).padStart(3, "0")}`;
}

function calculateRelativePosition(axes, gender) {
  if (!['woman', 'man'].includes(gender)) return null;
  const same = gender === 'woman' ? axes.women : axes.men;
  const different = gender === 'woman' ? axes.men : axes.women;
  if (!same.n || !different.n || same.score + different.score < 0.16) return null;
  return round(6 * same.score / (same.score + different.score), 2);
}

function renderAnalysis(analysis, language) {
  if (!analysis) return;
  const copy = RESULT_COPY[language] || RESULT_COPY.en;
  document.querySelector("#coverage-value").textContent = `${Math.round(analysis.coverage * 100)}% (${analysis.answered}/50)`;
  document.querySelector("#confidence-value").textContent = `${Math.round(analysis.stability * 100)}%`;
  document.querySelector("#sexual-position").textContent = analysis.kinseyStyle.sexual ?? copy[11];
  document.querySelector("#romantic-position").textContent = analysis.kinseyStyle.romantic ?? copy[11];
  renderAxisBars(document.querySelector("#sexual-axis-bars"), analysis.sexual, language, copy[12]);
  renderAxisBars(document.querySelector("#romantic-axis-bars"), analysis.romantic, language, copy[12]);
  renderSecondaryMetrics(analysis.indices, language, copy[12]);
}

function renderSecondaryMetrics(indices, language, itemLabel) {
  const labels = METRIC_LABELS[language] || METRIC_LABELS.en;
  document.querySelector("#detail-title").textContent = labels[0];
  const definitions = [
    ["sexualPresence", labels[1]],
    ["romanticPresence", labels[2]],
    ["fluidity", labels[3]],
    ["contextDependence", labels[4]],
    ["selfUnderstanding", labels[5]],
    ["identityComplexity", labels[6]],
    ["boundaries", labels[7]],
  ];
  const container = document.querySelector("#secondary-bars");
  container.className = "secondary-grid";
  container.replaceChildren(...definitions.map(([key, label]) => {
    const metric = indices[key];
    const row = document.createElement("div");
    row.className = "axis-row";
    row.innerHTML = `
      <div class="axis-row-head"><span>${label}</span><strong>${Math.round(metric.score * 100)}%</strong></div>
      <div class="axis-track">
        <span class="axis-range" style="left:${metric.low * 100}%;width:${Math.max(0, metric.high - metric.low) * 100}%"></span>
        <span class="axis-value" style="width:${metric.score * 100}%"></span>
      </div>
      <small>${metric.n} ${itemLabel} · ${Math.round(metric.low * 100)}–${Math.round(metric.high * 100)}%</small>`;
    return row;
  }));
}

function renderAxisBars(container, axes, language, itemLabel) {
  const labels = GENDER_LABELS[language] || GENDER_LABELS.en;
  const targetLabels = { women: labels[1], men: labels[2], nonbinary: labels[3] };
  container.replaceChildren(...Object.entries(axes).map(([target, axis]) => {
    const row = document.createElement("div");
    row.className = "axis-row";
    row.innerHTML = `
      <div class="axis-row-head"><span>${targetLabels[target]}</span><strong>${Math.round(axis.score * 100)}%</strong></div>
      <div class="axis-track">
        <span class="axis-range" style="left:${axis.low * 100}%;width:${Math.max(0, axis.high - axis.low) * 100}%"></span>
        <span class="axis-value" style="width:${axis.score * 100}%"></span>
      </div>
      <small>${axis.n} ${itemLabel} · ${Math.round(axis.low * 100)}–${Math.round(axis.high * 100)}%</small>`;
    return row;
  }));
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value, precision) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function genderizeQuestion(text, language, gender) {
  const form = gender === "woman" ? "feminine" : gender === "man" ? "masculine" : "neutral";
  let result = text;

  const pairsByLanguage = {
    pl: [
      ["byłem", "byłam"], ["byłbym", "byłabym"], ["byłeś", "byłaś"],
      ["poznałeś", "poznałaś"], ["czułeś", "czułaś"], ["czułbyś", "czułabyś"],
      ["flirtowałeś", "flirtowałaś"], ["całowałeś", "całowałaś"],
      ["dążyłeś", "dążyłaś"], ["nawiązałeś", "nawiązałaś"],
      ["odczuwałeś", "odczuwałaś"], ["poczułeś", "poczułaś"],
      ["spotykałeś", "spotykałaś"], ["szukałeś", "szukałaś"],
      ["umawiałeś", "umawiałaś"], ["wyobrażałeś", "wyobrażałaś"],
      ["wyrażałeś", "wyrażałaś"], ["zareagowałeś", "zareagowałaś"],
      ["zakochany", "zakochana"], ["odłączony", "odłączona"],
      ["zadowolony", "zadowolona"], ["pewny", "pewna"],
    ],
    es: [
      ["atraído", "atraída"], ["seguro", "segura"],
      ["desconectado", "desconectada"], ["satisfecho", "satisfecha"],
      ["sorprendido", "sorprendida"], ["preparado", "preparada"],
    ],
    pt: [
      ["atraído", "atraída"], ["seguro", "segura"],
      ["desconectado", "desconectada"], ["satisfeito", "satisfeita"],
      ["surpreso", "surpresa"], ["preparado", "preparada"],
    ],
  };

  const pairs = pairsByLanguage[language];
  if (!pairs) return result;

  pairs.forEach(([masculine, feminine]) => {
    if (form === "neutral") {
      const neutral = `${masculine}/${feminine}`;
      result = replaceGenderWord(result, masculine, neutral);
      result = replaceGenderWord(result, feminine, neutral);
    } else {
      const chosen = form === "feminine" ? feminine : masculine;
      result = replaceGenderWord(result, masculine, chosen);
      result = replaceGenderWord(result, feminine, chosen);
    }
  });

  return result;
}

function replaceGenderWord(text, word, replacement) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, "giu"), (match) => {
    if (match[0] === match[0].toUpperCase()) {
      return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
  });
}

function applyCompletionCopy(language) {
  const copy = RESULT_COPY[language] || RESULT_COPY.en;
  document.querySelector("#completion-eyebrow").textContent = copy[0];
  document.querySelector("#completion-title").textContent = copy[1];
  document.querySelector("#completion-body").textContent = copy[2];
  document.querySelector("#coverage-label").textContent = copy[3];
  document.querySelector("#confidence-label").textContent = copy[4];
  document.querySelector("#sexual-position-label").textContent = copy[5];
  document.querySelector("#romantic-position-label").textContent = copy[6];
  document.querySelector("#sexual-axis-title").textContent = copy[7];
  document.querySelector("#romantic-axis-title").textContent = copy[8];
  document.querySelector("#result-method").textContent = copy[9];
  document.querySelector("#restart-label").textContent = copy[10];
}

function applyLoaderCopy(language) {
  const copy = LOADER_COPY[language] || LOADER_COPY.en;
  document.querySelector("#loader-eyebrow").textContent = copy[0];
  document.querySelector("#loader-title").textContent = copy[1];
  document.querySelector("#loader-step-one").textContent = copy[2];
  document.querySelector("#loader-step-two").textContent = copy[3];
  document.querySelector("#loader-step-three").textContent = copy[4];
}

function applyLanguage(language) {
  const locale = window.WhereOnKinseyLocales[language] || window.WhereOnKinseyLocales.en;
  languageSelect.value = language;
  document.documentElement.lang = language;
  localStorage.setItem("whereOnKinsey.language", language);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translated = locale.ui[element.dataset.i18n];
    if (translated) element.textContent = translated;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const translated = locale.ui[element.dataset.i18nPlaceholder];
    if (translated) element.placeholder = translated;
  });

  const genderOptions = document.querySelectorAll('select[name="gender"] option');
  const labels = GENDER_LABELS[language] || GENDER_LABELS.en;
  genderOptions.forEach((option, index) => { option.textContent = labels[index]; });
  cancelAssessmentButton.textContent = (CANCEL_COPY[language] || CANCEL_COPY.en)[0];
  applyAccountCopy(language);
  applyLoaderCopy(language);
  applyCompletionCopy(language);
  if (ageInput.getAttribute("aria-invalid") === "true") validateAge();
  if (currentQuestion) renderQuestion(currentQuestion);
  if (currentSession?.analysis && !completionCard.hidden) renderAnalysis(currentSession.analysis, language);
}

backToProfile.addEventListener("click", () => {
  assessmentSection.hidden = true;
  section1.hidden = false;
  section1.scrollIntoView({ behavior: "smooth", block: "start" });
});

cancelAssessmentButton.addEventListener("click", () => {
  const copy = CANCEL_COPY[languageSelect.value] || CANCEL_COPY.en;
  if (!window.confirm(copy[1])) return;
  clearAnalysisTimers();
  localStorage.removeItem("whereOnKinsey.session");
  currentSession = null;
  currentQuestion = null;
  assessmentSection.hidden = true;
  analysisLoader.hidden = true;
  completionCard.hidden = true;
  questionCard.hidden = false;
  section1.hidden = false;
  section1.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Future assessment contract: 50 questions will be selected from a 300-item bank.
// Keeping this shape stable will make it easy to add adaptive question selection later.
window.WhereOnKinsey = {
  assessment: {
    bankSize: 300,
    sessionSize: 50,
    dimensions: ["sexual_attraction", "romantic_attraction", "fantasy", "desire", "experience", "emotional_bond", "fluidity", "conditions", "self_understanding"],
  },
};
