# India source roadmap — priority batch 1

Verified 22 October 2026. This roadmap governs the four India records in this batch; it does not change existing Saudi or UK content.

## National antimicrobial baseline

Use the **joint NCDC–ICMR National Treatment Guidelines for Antimicrobial Use in Infectious Disease Syndromes, Version 2.0, November 2025** before older ICMR editions.

- Official document: https://ncdc.mohfw.gov.in/uploads/pdf/amr17.pdf
- Title/edition: PDF page 3; printed clinical page numbers are offset by six PDF pages.
- Meningitis: section 2.3, printed p. 20.
- Acute undifferentiated fever: section 3.1, printed pp. 26–27.
- Sepsis: section 3.4, printed pp. 29–31.

Older ICMR web guidance may fill an explicitly identified detail, such as the uncomplicated rickettsial course and adult doxycycline dose. It must not silently replace the November 2025 investigation sequence. The fever payload shows the different chest-imaging timing side by side.

## Supplementary sources opened

| Use | Source and exact locator |
| --- | --- |
| Current sepsis supportive care | [SSC 2026](https://sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026), named recommendation sections in each payload |
| Sepsis diagnostic criteria | [Sepsis-3](https://jamanetwork.com/journals/jama/fullarticle/2492881), Table 1 and Box 3 |
| Meningitis diagnosis, treatment and sequelae | [WHO 2025 guideline, PAHO/BVS-hosted copy](https://docs.bvsalud.org/biblioref/2025/04/1592382/9789240108042-eng.pdf), sections A.1–A.4, B.1–B.6, C.2–C.4 and Table 3.2 |
| Adult meningitis doses and steroid timing | [WHO frontline toolkit](https://cdn.who.int/media/docs/default-source/crs-crr/epiwin_bacterial-meningitis-toolkit.pdf?sfvrsn=308f3198_1), slides 29–34 |
| Indian essential-medicine formulations | [NLEM 2022](https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2018/UploadConsumer/nlem2022.pdf), medicine-specific sections cited in the payloads |
| Stewardship classification framework | [WHO AWaRe 2025 publication](https://www.who.int/publications/i/item/B09489); download unavailable in this session. Individual categories were cross-checked against opened WHO clinical materials; the WHO/UK classifications must not be conflated. |
| Selected rickettsial pathway | [ICMR empirical principles](https://amrtg.icmr.org.in/chapter2-management-principles-empiric-therapy.html), [disease choice table](https://amrtg.icmr.org.in/chapter2-management-table1.html), [adult doxycycline dose](https://amrtg.icmr.org.in/table1-doxycycline.html) |
| STEMI India context | [MoHFW cardiovascular STG](https://clinicalestablishments.mohfw.gov.in/sites/default/files/standard-treatment-guidelines/3811.pdf), STEMI sections 2.0, 3.3–3.4; older source, not a claim of a current national programme protocol |
| Current reperfusion timing | [ACC/AHA 2025 ACS guideline](https://www.jacc.org/doi/10.1016/j.jacc.2024.11.009), sections 3.1, 5.2.1, 5.3; detailed search-index text available, direct full-page retrieval failed |
| Fibrinolysis contraindications | [ESC 2023 supplementary data](https://www.uniklinik-ulm.de/fileadmin/default/09_Sonstige/Klinische-Chemie/Downloads/ehad191_supplementary_data_ESC_Guideline_ACS_2023.pdf), section 6.3.2 and Table S11 |

Product information is supplementary to Indian treatment selection, not proof of an Indian brand licence. Exact opened URLs and sections for each drug are included in the JSON. NLEM listing does not establish stock, regulatory registration of an individual product or a hospital's permission to prescribe it.

## Antibiotic duration and governance

Every systemic antibiotic must have an indication, WHO AWaRe warning, review point and documented stop/renewal rule. Count effective empirical days towards the confirmed course.

- Uncomplicated rickettsial infection: the selected ICMR course is 7 days; do not extend it automatically.
- Uncomplicated meningitis: distinguish the Indian empirical 10–14-day plan from WHO's conditional 7-day recovered/unknown-pathogen option. Use organism-specific stop dates after identification; do not average the sources.
- Sepsis has **no national source-independent maximum course**. The national source explicitly makes duration depend on the focus, organism and response. A fixed universal total-course cap would be invented and may be unsafe.
- Gram-negative or staphylococcal meningitis needs **at least** 21 days in the Indian guideline, which is not a maximum.
- The payloads propose a **48-hour empirical prescription review/renewal cap**. This is a labelled Marifa governance proposal requiring local approval, not a national total-treatment limit and not permission to interrupt necessary therapy in unstable illness.

## Clinical decisions still requiring sign-off

Confirm local susceptibility, the higher-risk meningitis branch, risk-triggered resistant Gram-positive coverage, infusion preparation, drug-level access and transfer arrangements. The structural authoring audit cannot establish these facts or clinical approval. All new versions retain `clinicalReviewStatus: "pending"`.

The STEMI record is a targeted scope correction only. Its remaining clinical sections and complete antithrombotic/fibrinolytic order set remain unfinished and must not be described as a completed topic.
