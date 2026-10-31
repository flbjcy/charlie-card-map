# FindMyCharlie: project progress

**Jia Hao Liang · October 25–30, 2026 · all times Eastern**
**Live map:** https://flbjcy.github.io/find-my-charlie/  
**Source:** https://github.com/flbjcy/find-my-charlie

FindMyCharlie began as a way to turn scattered Reddit comments about eight limited-edition CharlieCard designs into a simple, usable map. It now combines reviewed Reddit sightings with reports submitted directly by collectors. A pin opens the card, machine, exit, observation time, source, and confidence details. It is an independent community project, not an MBTA service.

## Progress by time

Times are approximate Eastern time, based on source-control history and review logs. They describe changes and reviews, not when a collector visited a station.

| When (ET) | What changed |
| --- | --- |
| **Oct 25, 6 PM** | Built the shared map, report API and community form for eight card designs, with subway routes and station entrances. OpenStreetMap tiles require no paid map key. |
| **Oct 26, 1–2 PM** | Added reviewed Reddit sightings and a simpler map-first interface. Replaced generic symbols with cropped photos of the eight real cards. |
| **Oct 26, 9 PM** | Fixed the incorrectly plotted Green Line near Back Bay using official MBTA route shapes. |
| **Oct 26, 11 PM** | Published GitHub Pages as **FindMyCharlie**, connected it to the shared backend, and removed the failing sync banner. Added anonymous traffic counts, the lemon-yellow header, Garamond credit and sharper Beijing subway emblem. |
| **Oct 27, 2–10 AM** | Expanded reviews to related threads and nested replies. Made newer sold-out, broken and regular-only observations replace older stock reports for the same machine and card. |
| **Oct 27, 11 AM–2 PM** | Added card photos to the report form and a Report unavailable action. Grouped same-card reports by confidence using time, corroboration and useful details. Started the private evidence archive. |
| **Oct 27, 2–5 PM** | Corrected an edited Haymarket description without refreshing the sighting time. Fixed duplicate State pins, grouped machines under one station, and reduced overlapping labels and pointer crossings. |
| **Oct 27, 5–11 PM** | Published supported Reddit and community corrections, keeping Harvard machines separate. Added the developing FindMyCharlie discussion to the source registry. |
| **Oct 28, 1–2 AM** | Recovered a missed Tufts photo report: orange Old State House card, **221072**, observed Oct 27 at 8:30 PM. Added an older Airport silver report. Moved the PDF into Info and improved Aquarium/Tufts label positions and pointer lines. |
| **Oct 28, 11 AM** | Added optional machine photos, View photo links, resizing and metadata removal. Added an on-device clarity check, hourly anonymous activity counts, and GitHub cloud backups while the Mac sleeps. |
| **Oct 28, noon** | Distinguished Harvard **221121 down** from **221123 yellow** at 11:30 AM. Reviewed Park Street orange without duplicating a newer community report; normalized labels such as Unknown221123. |
| **Oct 28, 3 PM** | Reviewed 11 threads, including older replies: 304 of 325 displayed comments were accessible. Confirmed Park Street orange 221186 and recovered an older Malden purple photo report, 221030. |
| **Oct 28, 10 PM** | Added historical State yellow 221277, North silver 221045 and dark-blue 222029 confirmations. A newer negative superseded the dark-blue report. Updated measured activity charts. |
| **Oct 28, 10–11 PM** | Merged unique short machine suffixes with full IDs at the same station/card, including Park186 / 221186. Removed the mistaken Airport copy of an Aquarium report. Added browser-held removal keys, accepted payment choices and replacement of the default Unknown text when typing. |
| **Oct 29, 10 AM** | Caught up after deferred reviews. Added North Station green BPL 221042 at Valenti Way, observed 12:32 AM; the photo confirms the machine and text identifies the design. Incremental review covered 148 loaded comments in 11 threads. |
| **Oct 29, 6–7 PM** | Added a full-photo-confirmed Tufts orange 221072 reply, Medical Center side, using 5:38 PM posting time as a fallback for “just got.” A North silver photo corrected typed 222629 to **222029**, approximately 20 minutes later; exact time remained uncertain. |
| **Oct 30, 11 AM** | Searched for new discussions and reviewed 338 accessible comments of 360 displayed across 14 threads; 22 remained inaccessible. Inspected two new collection photos. Preserved uncertain recollections and cross-post context without inventing fresh stock. |
| **Oct 30, 2 PM** | Added private **Feedback** left of Report: Suggestion, Report an error, Other. Scheduled reviews triage messages. Corrected the Back Bay purple typo **221106 to 221107**, preserving the original report and observation time. Tested validation, private storage, spam limits and mobile layout. |
| **Oct 30, 2:30 PM** | Fixed GitHub map report loading after the backend host changed. The old host redirected without CORS headers, so browsers blocked requests despite intact data. Updated the frontend and archive to call the current backend directly; verified report reads and submission preflight. |
| **Oct 30, 3 PM** | Added a State yellow report from10:30 AM: two far-right machines at the Old State House entrance. Machine numbers and exact exit remain unknown. The already-corrected Back Bay request was not counted as a new sighting. |
| **Oct 30, 5–9 PM** | Removed all eight store entries from station reports. Added a compact **yellow star** at 296 Washington St, layered above routes and below station dots/cards; hover, keyboard focus or tap reveals store details. State contains only station reports. Reviewed two private correction messages: replacement reports already had the corrected machines and times. Corrected three Harvard **22123** typos to **221123**, preserving times and the yellow sold-out report. |

## Problems we found and how we handled them

| Problem | Change or current status |
| --- | --- |
| **Comments were spread across multiple threads and nested replies.** | Tracked relevant discussions, kept source links and review notes, and reviewed reply context. Checks every two hours compare recent comments; wider expanded reviews are scheduled daily. Coverage is reported honestly when older or collapsed comments cannot be opened. |
| **Reddit's server API was blocked.** | Used browser-reviewed reports rather than pretending the map had a live Reddit feed. Community submissions go into the shared backend immediately; Reddit additions depend on the scheduled review and successful publication. |
| **A report could be stale after cards sold out or a machine broke.** | Kept negative observations in history and hid superseded availability for the same machine and card. A negative for one machine does not erase a different machine at the same station. |
| **Harvard yellow and Forest Hills green seemed missing or inconsistent.** | Separated machine-specific reports and their observation times. Harvard 221121 sold out while 221123 had later positive reports; Forest Hills 221270 had a later negative while separate community reports identified 221100. The map now preserves these distinctions. |
| **A single station appeared as two pins.** | Grouped reports by station before drawing markers, so State has one pin with its different machines and cards inside. |
| **Many reports for one card made a station panel hard to scan.** | Grouped by card, ranked current machine reports by recency and corroboration, and put earlier reports in expandable history. Longer prose alone does not raise confidence. |
| **A machine number attached to a word produced a duplicate row.** | Recognized six-digit machine numbers even in entries such as “Unknown221123,” so they merge with reports that write “Machine 221123.” On Oct 28 at 11 PM, also standardized displayed labels: a single identifiable machine number (e.g. “Unknown221054” becomes “221054”), or “Unknown” otherwise. Original wording stays stored. |
| **Short machine numbers appeared as separate machines.** | Matched a three- to five-digit suffix to a unique full ID at the same station and for the same card. Ambiguous suffixes remain separate. The same match is used for sold-out overrides and report history. |
| **A report was submitted under the wrong station.** | Excluded the mistaken Airport copy while keeping the Aquarium report. Added browser-held removal keys for new community submissions, so a submitter can retract an error and resubmit correctly. |
| **White station labels overlapped and pointer lines crossed boxes.** | Added a layout pass that finds freer positions around each station and clips connector lines at label edges. Dense maps can still be constrained by screen size and zoom. |
| **Aquarium and Tufts labels were reversed and downtown pointers clumped.** | Gave Aquarium the eastern label position, kept Tufts to its west, and penalized crossing pointer segments when choosing positions. The labels still move with zoom and available screen space. |
| **The Green Line path near Back Bay was inaccurate.** | Replaced the incorrect plotted section with MBTA route geometry. Lines are geographic context, not live service status. |
| **A Tufts photo report was missed.** | Full-size inspection revealed the orange card and machine number that were not in the comment text. This correction is recorded as a review error rather than silently rewriting the audit. A related-thread check also found an older Airport silver report. Other photo-only reports need the same explicit visual check. |
| **An older Malden photo was overlooked.** | Rechecked the photo and its nearby comment: the image shows the purple Zakim Bridge card, and the comments identify Malden Center machine 221030. Added the historical sighting with the October 23 posting time as a fallback and an explicit warning that current stock is unknown. |
| **Public data needed a recoverable history.** | Created a private GitHub archive of dated report-feed snapshots, including community submissions, plus reviewed Reddit evidence and coverage notes. It is not a complete verbatim copy of every Reddit comment. |
| **Machine and payment details were hard to report.** | Added optional machine photos and accepted-payment choices. “Unknown” machine text is selected on click so a reporter can replace it by typing. |
| **A machine photo could be too blurry or dark to help anyone.** | Added a conservative browser-only quality check before upload. It catches obvious technical problems, but it does not verify that a photo depicts a machine or screen for inappropriate content. |
| **Local browser reviews stop when the Mac locks or sleeps.** | Kept the live site independent of the Mac and added a cloud backup for public reports and hourly counts. This preserves new community submissions while offline, but it does not read new Reddit comments; that requires a separate approved cloud integration. |

## Hourly activity

The charts in the PDF use a snapshot taken **October 30 at about 9 PM ET**. They show **2,085 recorded page views**, **1,846 approximate visits**, and **190 community submissions** from the first recorded traffic hour (**October 26 at 11 PM ET**) through the current hour. Hours with no activity are included as zeroes. Community reports are grouped by *submission time*, not the time a collector says they observed a machine. The traffic log begins when the counter was introduced; earlier page views cannot be reconstructed. Privacy opt-outs and known bots are excluded. The underlying hourly aggregate is saved in the project’s public source as report-data/hourly-activity-2026-10-31T0100Z.json; it contains counts, not visitor identifiers.

## Measured snapshot

At **about 1:35 AM ET on October 28**, before the Tufts correction was published, the live site showed **388 page views** and **362 visits** in its 90-day anonymous traffic dashboard. It served **97 report entries**: **46 community reports** and **51 reviewed Reddit reports**, including historical and unavailable entries. These are report entries, not unique people or currently available machines. Visits are approximate browser-tab sessions; reloads add page views. The dashboard excludes known bots and privacy opt-outs. The count will change as new reports arrive.

## How the system works now

GitHub Pages serves the public map at the address above. A shared Sites backend stores community reports and serves the report feed, while reviewed Reddit evidence is incorporated through published source updates. Official MBTA station, entrance, and route geometry supplies map context; when a comment does not identify an entrance, the site says **Exit unknown**. The map deliberately avoids claiming that an older sighting guarantees stock today. The private archive is kept separately from the public website repository.

## What remains imperfect

Reddit browser access is not guaranteed, and a scheduled review is not instant or exhaustive. Photo-only details, deep replies, edits, and ambiguous station language need manual attention. Visitor counts are approximate, and machine availability can change between any observation and a collector's arrival. Future reviews should inspect full-size images attached to candidate comments before excluding a sighting.

## Evidence and links

- [Public website and code](https://github.com/flbjcy/find-my-charlie)
- [Original r/mbta discussion](https://www.reddit.com/r/mbta/comments/1xaqcns/limited_edition_special_design_charlie_cards/)
- [FindMyCharlie Reddit discussion](https://www.reddit.com/r/mbta/comments/1xhdiol/findmycharlie_an_interactive_map_to_find/)
- [Tufts Medical Center photo report](https://www.reddit.com/r/mbta/comments/1xaqcns/comment/19rr8kfh46wlh/)
- [Public traffic dashboard](https://flbjcy.github.io/find-my-charlie/?traffic=1)
- [MBTA V3 API](https://api-v3.mbta.com/)

The timeline was reconstructed from the project and GitHub commit histories; the traffic and report totals were read from the live site at the stated time. The private archive contains fuller review evidence and dated report snapshots.
