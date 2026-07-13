/*
 * Original, non-diagnostic assessment item bank.
 * Research-informed structure; not a validated psychometric instrument.
 */

const ANSWER_SCALES = {
  frequency: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
  intensity: ["Not at all", "Slightly", "Moderately", "Strongly", "Extremely"],
  desire: ["No desire", "Low desire", "Moderate desire", "Strong desire", "Very strong desire"],
  experience: ["Never", "Once", "A few times", "Often", "Many times"],
  agreement: ["Strongly disagree", "Disagree", "Neither", "Agree", "Strongly agree"],
  comfort: ["Very uncomfortable", "Uncomfortable", "Neutral", "Comfortable", "Very comfortable"],
};

const TARGETS = [
  { id: "women", label: "women" },
  { id: "men", label: "men" },
  { id: "nonbinary", label: "non-binary people" },
];

const bank = [];
let nextId = 1;

function addTargeted(dimension, scale, stems) {
  stems.forEach((stem) => TARGETS.forEach((target) => bank.push({
    id: `q${String(nextId++).padStart(3, "0")}`,
    dimension,
    target: target.id,
    scale,
    text: stem.replace("{target}", target.label),
  })));
}

function addNeutral(dimension, scale, questions) {
  questions.forEach((text) => bank.push({
    id: `q${String(nextId++).padStart(3, "0")}`,
    dimension,
    target: "none",
    scale,
    text,
  }));
}

// 186 target-specific items: the same constructs are measured independently
// for women, men, and non-binary people rather than forcing a bipolar choice.
addTargeted("sexual_attraction", "frequency", [
  "How often do you notice sexual attraction toward {target}?",
  "How often does seeing an appealing {target} create a physical sense of attraction for you?",
  "How often do you feel sexually drawn to {target} you have just met?",
  "How often do you keep thinking about a {target} because you find them sexually attractive?",
  "How often do you notice sexual chemistry with {target}?",
  "How often do you feel sexually interested in {target} without wanting a romantic relationship?",
]);
addTargeted("sexual_attraction", "intensity", [
  "How intense is your typical sexual attraction toward {target}?",
  "How strong is your physical response when you are sexually attracted to {target}?",
  "How strongly can the appearance of {target} contribute to sexual attraction for you?",
  "How strongly can the voice or mannerisms of {target} contribute to sexual attraction for you?",
  "How powerful does sexual chemistry with {target} tend to feel?",
  "How strongly do you want sexual closeness when you are attracted to {target}?",
]);

addTargeted("romantic_attraction", "frequency", [
  "How often do you develop romantic feelings for {target}?",
  "How often do you imagine dating a {target} you find appealing?",
  "How often do you want emotional closeness with {target} in a romantic way?",
  "How often have you felt a romantic crush on {target}?",
  "How often do you picture building a relationship with {target}?",
  "How often do affectionate moments with {target} feel romantic to you?",
]);
addTargeted("romantic_attraction", "intensity", [
  "How intense are your romantic feelings when you fall for {target}?",
  "How strongly do you want to be chosen as a romantic partner by {target}?",
  "How strong is your wish to share everyday life with {target} as a couple?",
  "How deeply can you become emotionally invested in a romantic relationship with {target}?",
  "How strongly does the idea of a committed relationship with {target} appeal to you?",
  "How strongly do you desire romantic affection from {target}?",
]);

addTargeted("fantasy", "frequency", [
  "How often do {target} appear in your sexual fantasies?",
  "How often do you imagine kissing {target} in a sexual context?",
  "How often do you imagine sexual closeness with {target}?",
  "How often do spontaneous sexual thoughts about {target} occur to you?",
  "How often do you deliberately fantasize sexually about {target}?",
]);
addTargeted("fantasy", "intensity", [
  "How arousing do sexual fantasies involving {target} feel to you?",
  "How vivid are your sexual fantasies involving {target}?",
  "How compelling is the idea of sexual intimacy with {target} in fantasy?",
  "How strongly do fantasies about {target} hold your attention?",
  "How emotionally meaningful can fantasies involving {target} feel?",
]);

addTargeted("desire", "desire", [
  "How much desire do you feel to kiss {target} in a sexual way?",
  "How much desire do you feel for sexual touch with {target}?",
  "How much desire do you feel to explore sexual intimacy with {target}?",
  "How much desire do you feel to initiate sexual closeness with {target}?",
  "How much desire do you feel to respond when {target} show sexual interest in you?",
  "How much desire do you feel for recurring sexual contact with {target}?",
  "How much desire do you feel for a private sexual encounter with {target}?",
  "How much desire do you feel to express sexual attraction to {target}?",
  "How much desire do you feel to be sexually desired by {target}?",
  "How much desire do you feel to discover what sexual chemistry with {target} would be like?",
]);

addTargeted("experience", "experience", [
  "How many times have you knowingly flirted with {target} because you felt sexually attracted?",
  "How many times have you kissed {target} because of sexual attraction?",
  "How many times have you pursued sexual closeness with {target}?",
  "How many times have you responded positively to sexual interest from {target}?",
  "How many times have you chosen to date {target} because of romantic attraction?",
  "How many times have you formed a romantic relationship with {target}?",
  "How many times have you expressed a romantic crush to {target}?",
  "How many times have you sought emotional intimacy with {target} as a potential partner?",
  "How many times have you imagined a real encounter with {target} after feeling attraction?",
  "How many times have you felt that an experience with {target} clarified your attractions?",
]);

addTargeted("emotional_bond", "intensity", [
  "How strong can your emotional bond with {target} become in a romantic relationship?",
  "How strongly can you fall in love with {target}?",
  "How strongly do you value romantic tenderness from {target}?",
  "How deeply can you miss a {target} you love romantically?",
]);
addTargeted("emotional_bond", "comfort", [
  "How comfortable would you feel introducing a {target} as your romantic partner?",
  "How comfortable would you feel showing romantic affection to {target} in public?",
  "How comfortable would you feel planning a future with a {target} partner?",
  "How comfortable would you feel discussing romantic feelings for {target} with someone you trust?",
]);

// 114 target-neutral items capture absence of attraction, romantic attraction,
// fluidity, contextual patterns, self-understanding, and response comfort.
addNeutral("sexual_attraction_level", "agreement", [
  "Sexual attraction is a regular part of my life.",
  "I can recognize beauty without feeling sexual attraction.",
  "I rarely feel sexually drawn to a specific person.",
  "My interest in sexual activity can exist without attraction to another person.",
  "I sometimes feel disconnected from the way others describe sexual attraction.",
  "Sexual attraction tends to arise only under unusual circumstances for me.",
  "I can enjoy affection without wanting it to become sexual.",
  "I find it easy to distinguish sexual attraction from general admiration.",
  "I have experienced periods with no sexual attraction toward anyone.",
  "Feeling sexually wanted is different from feeling sexual attraction for me.",
  "My level of sexual attraction is lower than most people seem to describe.",
  "I can be curious about sex without wanting sex with a particular person.",
  "Sexual attraction feels clear and recognizable when I experience it.",
  "I have mistaken romantic or aesthetic interest for sexual attraction before.",
  "Sexual attraction develops quickly for me.",
  "Sexual attraction feels optional rather than necessary in a close relationship.",
  "I would be content in a relationship with little or no sexual attraction.",
  "My interest in sexual content does not reliably indicate attraction to real people.",
  "I experience sexual attraction independently from my general level of libido.",
  "The absence of sexual attraction would not make my close relationships less meaningful.",
]);

addNeutral("romantic_attraction_level", "agreement", [
  "Romantic attraction is a regular part of my life.",
  "I can want deep emotional closeness without wanting romance.",
  "I rarely develop romantic crushes.",
  "Traditional couple relationships appeal to me personally.",
  "I sometimes feel disconnected from the way others describe falling in love.",
  "I can enjoy dating without experiencing romantic attraction.",
  "Romantic gestures feel meaningful to me when directed toward me.",
  "I find it easy to distinguish romantic attraction from close friendship.",
  "I have experienced periods with no romantic attraction toward anyone.",
  "I would be content without a romantic partnership.",
  "The idea of being someone's romantic priority appeals to me.",
  "I have mistaken strong friendship for romantic attraction before.",
  "Romantic attraction develops quickly for me.",
  "I need romantic attraction for a partnership to feel complete.",
  "I prefer forms of commitment that are not necessarily romantic.",
  "Being in love feels distinct from caring deeply for a friend.",
  "I actively seek opportunities for romantic connection.",
  "My desire for companionship can exist without romantic attraction.",
]);

addNeutral("fluidity", "agreement", [
  "The people I am attracted to have changed over time.",
  "The intensity of my attractions varies across different periods of my life.",
  "My romantic and sexual attractions have changed in different ways.",
  "A label that once fit me no longer describes me fully.",
  "I expect my understanding of my orientation may continue to evolve.",
  "My fantasies have changed more than my real-life attractions.",
  "My behavior has changed even when my attractions have not.",
  "Important relationships have influenced how I understand my attractions.",
  "My attractions feel stable across time.",
  "Periods of stress or wellbeing affect how strongly I notice attraction.",
  "My attractions can surprise me.",
  "I have felt attraction outside the pattern I usually expect for myself.",
  "The balance between sexual and romantic attraction shifts for me over time.",
  "My current attractions differ from those I remember earlier in life.",
  "My ideal future relationships differ from my past relationships.",
  "I need room for uncertainty when describing my orientation.",
  "My attractions depend more on the individual than on a fixed gender pattern.",
  "The words I use for myself have changed as I learned more about attraction.",
  "My orientation feels consistent even when my experiences vary.",
  "A single fixed point on a scale would not capture my experience across time.",
]);

addNeutral("conditions", "agreement", [
  "Sexual attraction usually appears only after I form a strong emotional bond.",
  "Romantic attraction usually appears only after I know someone well.",
  "Trust is necessary before I can notice sexual attraction clearly.",
  "Trust is necessary before I can notice romantic attraction clearly.",
  "Intellectual connection can strongly increase my attraction.",
  "Emotional safety can strongly increase my attraction.",
  "Someone's personality matters more to my attraction than their appearance.",
  "Physical appearance can create attraction before any emotional connection exists.",
  "Being attracted to someone does not automatically make me want to act on it.",
  "My attraction tends to fade if emotional compatibility is missing.",
  "Reciprocal interest makes it easier for me to feel attraction.",
  "I can remain attracted to someone who does not return my feelings.",
  "My sexual attraction depends strongly on the situation.",
  "My romantic attraction depends strongly on the situation.",
  "I need privacy and security before desire feels accessible.",
  "Fantasy feels easier for me than real-life sexual attraction.",
  "Fantasy feels easier for me than real-life romantic involvement.",
  "My attraction is influenced by how another person expresses their gender.",
  "My attraction is influenced more by personal chemistry than by labels.",
  "I can feel attraction without wanting any kind of relationship.",
]);

addNeutral("self_understanding", "agreement", [
  "I feel confident that I understand my sexual attractions.",
  "I feel confident that I understand my romantic attractions.",
  "My sexual and romantic orientations feel different from each other.",
  "The same orientation label describes both my sexual and romantic attraction.",
  "I prefer describing my attractions rather than choosing a label.",
  "Having a clear orientation label is important to me.",
  "I am currently questioning some part of my orientation.",
  "I can accept attraction even when it conflicts with my expectations.",
  "I feel pressure to describe my orientation more simply than it feels.",
  "My past behavior does not fully define my orientation.",
  "My fantasies do not fully define my orientation.",
  "My current relationship does not fully define my orientation.",
  "I can acknowledge attraction without needing to change my identity label.",
  "I would like more clarity about the pattern of my attractions.",
  "I feel at peace with uncertainty about my orientation.",
  "I trust my own experience more than other people's assumptions about me.",
  "I can discuss my orientation honestly with at least one trusted person.",
  "Learning about different kinds of attraction has helped me understand myself.",
]);

addNeutral("comfort_and_boundaries", "agreement", [
  "I feel safe answering questions about attraction in private.",
  "I can separate what I desire from what I actually choose to do.",
  "I feel free to decline experiences that do not interest me.",
  "I can communicate my boundaries when attraction is present.",
  "I can enjoy a fantasy without wanting it to happen in real life.",
  "I can value an experience without wanting to repeat it.",
  "Social expectations have influenced some of my relationship choices.",
  "Fear of judgement has made it harder to explore my attractions.",
  "Privacy makes it easier for me to answer honestly about attraction.",
  "I sometimes answer questions about sexuality according to expectations rather than feelings.",
  "I can distinguish genuine attraction from a wish to be accepted.",
  "I can distinguish attraction from enjoying another person's attention.",
  "I can distinguish romantic interest from sexual desire.",
  "I can distinguish emotional closeness from romantic interest.",
  "Consent and mutual comfort are essential to any experience I would choose.",
  "Not having experience does not prevent me from recognizing attraction.",
  "Having experience does not necessarily mean I felt attraction.",
  "I am comfortable leaving a question unanswered when it does not fit my experience.",
]);

if (bank.length !== 300) {
  throw new Error(`Question bank must contain exactly 300 items; found ${bank.length}.`);
}

window.WhereOnKinseyQuestionBank = Object.freeze(bank);
window.WhereOnKinseyAnswerScales = Object.freeze(ANSWER_SCALES);

