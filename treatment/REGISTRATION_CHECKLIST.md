# Registration Checklist — The President's Rule

This checklist guides the formal IP registration of the treatment generated
by `scripts/generate_treatment.py`. Follow the steps in order.

---

## 1. Pre-Filing — Verify the Generated Treatment

- [ ] Open `treatment/THE_PRESIDENTS_RULE_TREATMENT.html` in a browser
- [ ] Use **File → Print → Save as PDF** (A4, default margins) to produce
      `THE_PRESIDENTS_RULE_TREATMENT.pdf`
- [ ] Confirm: title page, logline, synopsis, themes, all 24 chapters + epilogue,
      character section, source materials, declaration, and content hash are
      all present.
- [ ] Read the Declaration of Authorship at the end. Sign a printed copy
      and keep with your records (the digital signature line is for filing).

## 2. SWA India — Primary Registration (Member No. 46108)

The Screenwriters Association of India is your primary registry.

- [ ] Visit: **https://swaindia.org/registration**
- [ ] Log in with your existing Member ID **46108**
- [ ] Select **Online Registration**
- [ ] Title: *The President's Rule*
- [ ] Form: **Story** or **Story Outline** (treatment falls under Story for SWA)
- [ ] Upload: `THE_PRESIDENTS_RULE_TREATMENT.pdf` (must be < 10 MB; if larger,
      use the .txt version as a fallback)
- [ ] Pay the registration fee (₹500 for SWA members at time of writing —
      confirm current rate)
- [ ] **Download the SWA Registration Certificate immediately and save it to
      `registration/SWA_Certificate_<date>.pdf`** in this repository
- [ ] Commit the certificate to git so the timestamp is preserved alongside
      the work itself

## 3. WGAW Registry — Secondary Registration (Recommended)

The Writers Guild of America West Registry provides a US legal-record copy.
Non-members can register at the same fee.

- [ ] Visit: **https://www.wgawregistry.org**
- [ ] Create an account (use email of record: lingappa.vishwa@gmail.com)
- [ ] Click **Register Your Work**
- [ ] Type: **Novel / Treatment**
- [ ] Title: *The President's Rule*
- [ ] Author: Vishwa Shambhulingappa
- [ ] Upload: `THE_PRESIDENTS_RULE_TREATMENT.pdf` (or .txt if size limits apply)
- [ ] Pay the $25 USD registration fee
- [ ] Download the WGAW Registration Certificate and save it to
      `registration/WGAW_Certificate_<date>.pdf`

## 4. Optional but Strongly Recommended — Indian Copyright Office

A statutory copyright registration with the Government of India is the
strongest claim available.

- [ ] Visit: **https://copyright.gov.in/UserRegistration/frmLoginPage.aspx**
- [ ] Select **Literary/Dramatic Work**
- [ ] Submit Form XIV with the treatment + statement of particulars
- [ ] Fee: ₹500 for a literary work
- [ ] This takes 6–12 months but provides the strongest legal evidence

## 5. Self-Maintained Evidence

Independent of any registry, maintain the following inside this repository:

- [ ] **Git history is your timeline.** The first commit on this repo (5db…
      or whichever hash) is your earliest provable date. Push every meaningful
      revision to GitHub.
- [ ] **Content hash.** The SHA-256 printed inside the treatment document
      itself is a self-verifying fingerprint. Save the hash separately in
      `registration/CONTENT_HASHES.md` whenever you regenerate the treatment.
- [ ] **Sunday Cinemas option agreement** (Governor_PaperWork). Keep the
      original signed copy in `manuscripts/` (already committed).

## 6. After Filing — Annotate the Repository

- [ ] Create `registration/` folder at repo root
- [ ] Save certificates with dated filenames
- [ ] Update the README with the registration numbers and dates
- [ ] Tag the git commit at the moment of filing:
      `git tag -a v1.0-treatment-filed -m "Treatment filed with SWA + WGAW"`
- [ ] Push the tag: `git push --tags`

---

## Notes on Registration Forms

**For SWA India:** They accept "Story Outline" as a category. Your treatment
qualifies. Do not select "Screenplay" unless you also have a screenplay form;
this is a novel treatment.

**For WGAW Registry:** Their definition of "Treatment" matches yours — a
prose narrative summary of a longer work. PDF is the preferred format; their
upload accepts up to 25 MB.

**For both:** What you are registering is the *expression* of the story, not
the *idea*. Concepts ("a doctor becomes governor") are not protectable; the
*specific* characters, dialogue, scene order, and language are. The generated
treatment is rich in all four — protect it accordingly.

---

*This checklist was generated alongside the treatment. Re-run
`scripts/generate_treatment.py` whenever the treatment changes, and re-file
the updated version (most registries allow amendments at a reduced fee).*
