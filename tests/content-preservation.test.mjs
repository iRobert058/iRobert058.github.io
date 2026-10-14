import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// No content may get lost in the V3.0 redesign: every string value that was in the JSON on main at V2.1
// (snapshotted in fixtures/v2.1-strings.json) must still be a string value somewhere in today's JSON.
const root = new URL("../", import.meta.url);
const baseline = JSON.parse(readFileSync(new URL("tests/fixtures/v2.1-strings.json", root), "utf8")).strings;

const current = new Set();
const collect = (value) => {
  if (typeof value === "string") current.add(value);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
for (const dir of ["data", "content"]) {
  for (const file of readdirSync(new URL(dir, root)).filter((f) => f.endsWith(".json"))) {
    collect(JSON.parse(readFileSync(new URL(`${dir}/${file}`, root), "utf8")));
  }
}

// Strings that were retired on purpose, each with the reason. Anything else that disappears fails the test.
const COPY_EDIT_08F0158 = "copy and translation edit by Robert in 08f0158";
const retired = new Map([
  ["assets/img/project-thesis.svg", "V3.0: the thesis illustration was replaced (the old file stays in assets/img/)"],
  ["Screenshot van de experimentomgeving", "V3.0: alt text of the replaced thesis illustration"],
  ["Screenshot of the experiment environment", "V3.0: alt text of the replaced thesis illustration"],
  // Copy and translation edits Robert made himself after V3.0
  ["Alongside my studies I work at Amac in Apeldoorn, where I progressed from Junior Sales Associate to Daily Operations Lead in two years and worked across several branches to share knowledge and experience. That combination keeps me sharp: theory on user behaviour in the lecture hall, and real users in front of me on the shop floor every day.", COPY_EDIT_08F0158],
  ["Daily Operations Lead at Amac, Apeldoorn", COPY_EDIT_08F0158],
  ["Daily Operations Lead bij Amac, Apeldoorn", COPY_EDIT_08F0158],
  ["Fotografie, audio en af en toe gamen", COPY_EDIT_08F0158],
  ["Ga naar de inhoud", COPY_EDIT_08F0158],
  ["I'm Robert Karzijn. My interest lies at the intersection of people and technology: how people use interfaces, which habits form along the way, and how design (deliberately or not) plays into that. In my bachelor's thesis I experimentally investigated how web shops can disrupt procedural memory by relocating interface elements.", COPY_EDIT_08F0158],
  ["I'm currently pursuing a master's in Human-Computer Interaction, focusing on cognitive UX and ethical interface design. Outside study and work: photography, audio and the occasional evening of gaming.", COPY_EDIT_08F0158],
  ["In twee jaar van Junior Sales Associate naar Senior Sales Associate met dagverantwoording.", COPY_EDIT_08F0158],
  ["Intro afspelen", COPY_EDIT_08F0158],
  ["Intro pauzeren", COPY_EDIT_08F0158],
  ["Master's student in Human-Computer Interaction, holding a bachelor's degree in Information Sciences from Utrecht University. I'm at my best in between parties: understanding stakeholders and users, translating requirements into design and bringing people along from research and speaker acquisition to the shop floor at Amac.", COPY_EDIT_08F0158],
  ["Momenteel volg ik de master Human-Computer Interaction, met focus op cognitieve UX en ethisch interface-ontwerp. Buiten studie en werk: fotografie, audio en af en toe een avond gamen.", COPY_EDIT_08F0158],
  ["Naast mijn studie werk ik bij Amac in Apeldoorn, waar ik in twee jaar doorgroeide van Junior Sales Associate naar Daily Operations Lead en in verschillende filialen meedraaide om kennis en ervaring te delen. Die combinatie houdt me scherp: theorie over gebruikersgedrag in de collegezaal, en elke dag echte gebruikers tegenover me op de winkelvloer.", COPY_EDIT_08F0158],
  ["Op dit moment", COPY_EDIT_08F0158],
  ["Pause intro", COPY_EDIT_08F0158],
  ["Photography, audio and the occasional game", COPY_EDIT_08F0158],
  ["Play intro", COPY_EDIT_08F0158],
  ["Replay intro", COPY_EDIT_08F0158],
  ["Right now", COPY_EDIT_08F0158],
  ["Skip to content", COPY_EDIT_08F0158],
  ["This site uses no cookies, no trackers and no deceptive patterns, the latter happens to be my field of research ;).", COPY_EDIT_08F0158],
  ["Three projects that show how I work: empirical research, designing and building an app myself, and organising against a deadline.", COPY_EDIT_08F0158],
  ["Uitzoeken hoe mensen zich echt gedragen, niet hoe we denken dat ze dat doen.", COPY_EDIT_08F0158],
  ["Vier momenten die mijn profiel het best samenvatten.", COPY_EDIT_08F0158],
  ["Afsluitend onderzoek van mijn bachelor Information Sciences: experiment met 40 deelnemers, beoordeeld met een 8,5.", "V3.1: the thesis result now leads with the findings"],
  ["Ask me about the results →", "V3.1: the thesis result now leads with the findings"],
  ["Vraag me naar de resultaten →", "V3.1: the thesis result now leads with the findings"],
  ["2024 - 2026", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["About me", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Bachelor's degree obtained at Utrecht University, Main track: Human-Technology Interaction. Second track: Information Systems.", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Bachelordiploma behaald aan de Universiteit Utrecht, hoofdtrack: Mens-technologie interactie. 2de track: Informatiesystemen. ", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Bekijk mijn GitHub ↗", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Certificaten", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Certificates", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Current", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Deze site gebruikt geen cookies, geen trackers en geen deceptive patterns en dat laatste is toevallig mijn onderzoeksgebied ;).", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Ervaring & opleiding", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Experience & education", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Featured projects", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Four moments that best summarise my profile.", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Highlights", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Hoogtepunten", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["How I work", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Human-Computer Interaction · UX Research", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Human-Computer Interaction · UX-onderzoek", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Ik ben Robert Karzijn. Mijn interesse ligt op het snijvlak van mens en technologie: hoe mensen interfaces gebruiken, welke gewoontes daarbij ontstaan en hoe ontwerp daar (zowel bewust of onbewust) op inspeelt. In mijn bachelorthesis onderzocht ik experimenteel hoe webshops procedureel geheugen kunnen verstoren door interface elementen te verplaatsen.", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Masterstudent Human-Computer Interaction, met een bachelor Informatiekunde van Universiteit Utrecht. Ik voel me het meest thuis tussen partijen: stakeholders en gebruikers begrijpen, eisen vertalen naar ontwerp en mensen meenemen in het verhaal van onderzoek en sprekersacquisitie tot de winkelvloer bij Amac.", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Uitgelichte projecten", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["View my GitHub ↗", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Waar ik goed in ben", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Werkwijze", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["What I'm good at", "V3.1 critique: hero, highlights strip, two-tone headlines, Werkwijze merged into Skills, copy fixes"],
  ["Please fill in all fields with a valid email address.", "V3.1: the form names what is wrong per field"],
  ["Vul alle velden in met een geldig e-mailadres.", "V3.1: the form names what is wrong per field"],
  ["A fully booked speaker programme for the 2026 edition - from first email to speaker on stage.", "V3.1: en dashes instead of hyphens; exec(ut) image alt describes the photo"],
  ["Een gevuld sprekersprogramma voor de editie van 2026 - van eerste mail tot spreker op het podium.", "V3.1: en dashes instead of hyphens; exec(ut) image alt describes the photo"],
  ["MobiPad - je iPhone als gamecontroller", "V3.1: en dashes instead of hyphens; exec(ut) image alt describes the photo"],
  ["MobiPad - your iPhone as a game controller", "V3.1: en dashes instead of hyphens; exec(ut) image alt describes the photo"],
  ["exec(ut) 2026 - speakers & programme", "V3.1: en dashes instead of hyphens; exec(ut) image alt describes the photo"],
  ["exec(ut) 2026 - sprekers & programma", "V3.1: en dashes instead of hyphens; exec(ut) image alt describes the photo"],
]);

test("every V2.1 content string still exists in the JSON", () => {
  const missing = baseline.filter((s) => !current.has(s) && !retired.has(s));
  assert.deepEqual(missing, [], `${missing.length} string(s) from V2.1 are gone`);
});

test("retired strings really were in the V2.1 snapshot", () => {
  for (const s of retired.keys()) assert.ok(baseline.includes(s), `not in the snapshot: ${s}`);
});

test("the baseline snapshot is not empty", () => {
  assert.ok(baseline.length > 300, `only ${baseline.length} strings in the snapshot`);
});
