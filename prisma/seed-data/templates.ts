export interface SeedEmailTemplate {
  key: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export const seedEmailTemplates: SeedEmailTemplate[] = [
  {
    key: "intro_v1",
    name: "Introduction Email",
    subject: "{{creatorName}} × {{brandName}} — quick idea for your team",
    body: `<p>Hi {{contactFirstName}},</p>
<p>I'm {{creatorName}} — {{creatorUSP}}. Based on your recent campaigns, there's clear overlap with my audience:</p>
<ul>
  <li>{{insightOne}}</li>
  <li>{{insightTwo}}</li>
  <li>Top stat: {{topStat}}</li>
</ul>
<p>I drafted a short media pack tailored for {{brandName}} with format options and projected performance.</p>
<p><a href="{{mediaPackUrl}}">View media pack (web)</a> — or see attached PDF.</p>
<p>If this looks interesting, here's my quick link to book a 15‑min call: <a href="{{calendlyUrl}}">{{calendlyUrl}}</a>.</p>
<p>Thanks!<br/>{{creatorName}}</p>`,
    variables: [
      "brandName",
      "contactFirstName", 
      "creatorName",
      "creatorUSP",
      "topStat",
      "insightOne",
      "insightTwo",
      "calendlyUrl",
      "mediaPackUrl",
      "pdfUrl"
    ]
  },
  {
    key: "proof_v1",
    name: "Proof Points Follow-up",
    subject: "Results from creators like {{creatorName}} + 1 idea for {{brandName}}",
    body: `<p>Hi {{contactFirstName}},</p>
<p>Following up with a quick proof point and a concrete idea for {{brandName}}.</p>
<ul>
  <li>{{insightOne}}</li>
  <li>{{insightTwo}}</li>
  <li>Top stat: {{topStat}}</li>
</ul>
<p>Media pack (in case you missed it): <a href="{{mediaPackUrl}}">open</a> — PDF attached again for convenience.</p>
<p>Calendar: <a href="{{calendlyUrl}}">{{calendlyUrl}}</a></p>
<p>Best,<br/>{{creatorName}}</p>`,
    variables: [
      "brandName",
      "contactFirstName",
      "creatorName", 
      "topStat",
      "insightOne",
      "insightTwo",
      "calendlyUrl",
      "mediaPackUrl"
    ]
  },
  {
    key: "nudge_v1",
    name: "Final Nudge",
    subject: "Last note — {{brandName}} collab options (15-min?)",
    body: `<p>Hi {{contactFirstName}},</p>
<p>Closing the loop — happy to park if timing's not right. If useful, I can propose 2 quick formats tailored to your current push:</p>
<ol>
  <li>Format A: Product spotlight + story (3 posts)</li>
  <li>Format B: UGC + giveaway (1 post + 1 story + 1 short)</li>
</ol>
<p>Media pack (web): <a href="{{mediaPackUrl}}">open</a>.  Calendar: <a href="{{calendlyUrl}}">{{calendlyUrl}}</a>.</p>
<p>Thanks either way!<br/>{{creatorName}}</p>`,
    variables: [
      "brandName",
      "contactFirstName",
      "creatorName",
      "calendlyUrl", 
      "mediaPackUrl"
    ]
  }
];
