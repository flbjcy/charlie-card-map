# FindMyCharlie: project progress

**Jia Hao Liang · October 25–28, 2026 · all times Eastern**  
**Live map:** https://flbjcy.github.io/find-my-charlie/  
**Source:** https://github.com/flbjcy/find-my-charlie

FindMyCharlie began as a way to turn scattered Reddit comments about eight limited-edition CharlieCard designs into a simple, usable map. It now combines reviewed Reddit sightings with reports submitted directly by collectors. A pin opens the card, machine, exit, observation time, source, and confidence details. It is an independent community project, not an MBTA service.

## Progress by time

The times below are rounded to the hour from source-control history. They date published code changes, not necessarily the moment an idea was discussed or a station was visited.

| When (ET) | What changed |
| --- | --- |
| **Oct 25, 6 PM** | Built the first shared sightings map and report API. Added the eight card designs, station and exit data, subway shapes, and a form for community reports. The map uses OpenStreetMap tiles without a paid map key. |
| **Oct 26, 1–2 PM** | Added reviewed Reddit reports and refined the map-first interface. Replaced generic card symbols with cropped photos of the eight real card designs so collectors can recognize them quickly. |
| **Oct 26, 9 PM** | Corrected Green Line geometry near Back Bay using MBTA route shapes; the earlier plotted line was wrong. |
| **Oct 26, 11 PM** | Published the frontend on GitHub Pages, using the same shared backend for reports. Renamed the public site **FindMyCharlie** and moved it to `/find-my-charlie/`. Removed a failing manual Reddit-sync message from the main interface. |
| **Oct 26, 11 PM** | Added anonymous public traffic totals. Updated the lemon-yellow header and author credit, including Garamond type and a sharper, smaller circular Beijing subway emblem linked to Jia Hao Liang's personal GitHub Pages site. |
| **Oct 27, 2–10 AM** | Expanded reviews beyond the first thread into related Reddit discussions and nested replies. Corrected the treatment of sold-out or broken machines so older positive reports do not keep appearing as current stock. |
| **Oct 27, 11 AM–2 PM** | Clarified machine-specific sightings such as North Station silver and Harvard yellow. Added card photos to the report form, a direct “Report unavailable” action, and grouped same-card reports ranked by recency, corroboration, machine detail, and conflicting evidence. Started the private report-and-evidence archive. |
| **Oct 27, 2–5 PM** | Corrected an edited Haymarket machine description without pretending the sighting was new. Fixed duplicate station pins, including State, by showing one pin per station and grouping its cards and machines. Adjusted label placement to reduce overlapping white boxes and made pointer lines stop at box edges. |
| **Oct 27, 5–11 PM** | Continued publishing supported sightings and corrections from Reddit and community reports, including separate Harvard machines and a North Station dark-blue report. Added a newly developing FindMyCharlie discussion to the review registry. |
| **Oct 28, 1 AM** | A user pointed out that a Tufts Medical Center comment had been missed. Full-size photo review identified the orange Old State House card and machine **221072**, observed **Oct 27 at 8:30 PM**. A follow-up check found an older Airport silver report in another thread. Both reports were added to the reviewed data; the prior thumbnail-based exclusion was recorded as an error. |
| **Oct 28, 2 AM** | Moved the project PDF to the end of the map's information panel and linked the new FindMyCharlie Reddit discussion beside the author credit and on the personal site. Revised the downtown label layout so Aquarium sits east of Tufts Medical Center and pointer crossings count against candidate positions. |
| **Oct 28, 11 AM** | Added optional machine photos to community reports. The report form resizes and removes metadata from images before upload; each photo appears through a “View photo” link beside its machine details. Added an hourly statistics feed for page views, approximate visits, and community submissions. |
| **Oct 28, 11 AM** | Added a scheduled job in the private GitHub archive to back up public reports and anonymous hourly counts when the Mac is asleep. Its first manual test succeeded. Machine photos are backed up once when present. Reddit comment review remains dependent on browser access or an approved Reddit integration. |
| **Oct 28, 11 AM** | Added an on-device quality check to optional machine-photo uploads. It checks image size, exposure, contrast, and severe blur before upload; unusable images get a clear retake message. The check uses browser pixels without ChatGPT or a remote review service. |
| **Oct 28, 12 PM** | Published a machine-specific Harvard update: 221121 was down while 221123 had yellow Bunker Hill cards at 11:30 AM. Also reviewed an 11:59 AM orange confirmation at Park Street 221186; a newer community report already covered it, so no duplicate map entry was added. Kept same-author cross-posts from being treated as independent sightings. Normalized reports such as “Unknown221123” so the same numbered machine appears once. |

## Problems we found and how we handled them

| Problem | Change or current status |
| --- | --- |
| **Comments were spread across multiple threads and nested replies.** | Tracked relevant discussions, kept source links and review notes, and reviewed reply context. Hourly checks compare recent comments; wider expanded reviews are scheduled daily. Coverage is reported honestly when older or collapsed comments cannot be opened. |
| **Reddit's server API was blocked.** | Used browser-reviewed reports rather than pretending the map had a live Reddit feed. Community submissions go into the shared backend immediately; Reddit additions depend on the scheduled review and successful publication. |
| **A report could be stale after cards sold out or a machine broke.** | Kept negative observations in history and hid superseded availability for the same machine and card. A negative for one machine does not erase a different machine at the same station. |
| **Harvard yellow and Forest Hills green seemed missing or inconsistent.** | Separated machine-specific reports and their observation times. Harvard 221121 sold out while 221123 had later positive reports; Forest Hills 221270 had a later negative while separate community reports identified 221100. The map now preserves these distinctions. |
| **A single station appeared as two pins.** | Grouped reports by station before drawing markers, so State has one pin with its different machines and cards inside. |
| **Many reports for one card made a station panel hard to scan.** | Grouped by card, ranked current machine reports by recency and corroboration, and put earlier reports in expandable history. Longer prose alone does not raise confidence. |
| **A machine number attached to a word produced a duplicate row.** | Recognized six-digit machine numbers even in entries such as “Unknown221123,” so they merge with reports that write “Machine 221123.” |
| **White station labels overlapped and pointer lines crossed boxes.** | Added a layout pass that finds freer positions around each station and clips connector lines at label edges. Dense maps can still be constrained by screen size and zoom. |
| **Aquarium and Tufts labels were reversed and downtown pointers clumped.** | Gave Aquarium the eastern label position, kept Tufts to its west, and penalized crossing pointer segments when choosing positions. The labels still move with zoom and available screen space. |
| **The Green Line path near Back Bay was inaccurate.** | Replaced the incorrect plotted section with MBTA route geometry. Lines are geographic context, not live service status. |
| **A Tufts photo report was missed.** | Full-size inspection revealed the orange card and machine number that were not in the comment text. This correction is recorded as a review error rather than silently rewriting the audit. A related-thread check also found an older Airport silver report. Other photo-only reports need the same explicit visual check. |
| **Public data needed a recoverable history.** | Created a private GitHub archive of dated report-feed snapshots, including community submissions, plus reviewed Reddit evidence and coverage notes. It is not a complete verbatim copy of every Reddit comment. |
| **Machine descriptions were sometimes hard to follow.** | Added an optional photo so reporters can show the exact machine. Photos are public; the form asks people to avoid including bystanders. |
| **A machine photo could be too blurry or dark to help anyone.** | Added a conservative browser-only quality check before upload. It catches obvious technical problems, but it does not verify that a photo depicts a machine or screen for inappropriate content. |
| **Local browser reviews stop when the Mac locks or sleeps.** | Kept the live site independent of the Mac and added a cloud backup for public reports and hourly counts. This preserves new community submissions while offline, but it does not read new Reddit comments; that requires a separate approved cloud integration. |

## Hourly activity

The charts in the PDF use a snapshot taken **October 28 at 12:08 PM ET**. They show **650 recorded page views**, **600 approximate visits**, and **55 community submissions** from the first recorded traffic hour (**October 26 at 11 PM ET**) through the current hour. Hours with no activity are included as zeroes. Community reports are grouped by *submission time*, not the time a collector says they observed a machine. The traffic log begins when the counter was introduced; earlier page views cannot be reconstructed. Privacy opt-outs and known bots are excluded. The underlying hourly aggregate is saved in the project's public source as report-data/hourly-activity-2026-10-28T1608Z.json; it contains counts, not visitor identifiers.

## Measured snapshot

At **about 1:35 AM ET on October 28**, before the Tufts correction was published, the live site showed **388 page views** and **362 visits** in its 90-day anonymous traffic dashboard. It served **97 report entries**: **46 community reports** and **51 reviewed Reddit reports**, including historical and unavailable entries. These are report entries, not unique people or currently available machines. Visits are approximate browser-tab sessions; reloads add page views. The dashboard excludes known bots and privacy opt-outs. The count will change as new reports arrive.

## How the system works now

GitHub Pages serves the public map at the address above. A shared Sites backend stores community reports and serves the report feed, while reviewed Reddit evidence is incorporated through published source updates. Official MBTA station, entrance, and route geometry supplies map context; when a comment does not identify an entrance, the site says **Exit unknown**. The map deliberately avoids claiming that an older sighting guarantees stock today. The private archive is kept separately from the public website repository.

## What remains imperfect

Reddit browser access is not guaranteed, and an hourly review is not instant or exhaustive. Photo-only details, deep replies, edits, and ambiguous station language need manual attention. Visitor counts are approximate, and machine availability can change between any observation and a collector's arrival. Future reviews should inspect full-size images attached to candidate comments before excluding a sighting.

## Evidence and links

- [Public website and code](https://github.com/flbjcy/find-my-charlie)
- [Original r/mbta discussion](https://www.reddit.com/r/mbta/comments/1xaqcns/limited_edition_special_design_charlie_cards/)
- [FindMyCharlie Reddit discussion](https://www.reddit.com/r/mbta/comments/1xhdiol/findmycharlie_an_interactive_map_to_find/)
- [Tufts Medical Center photo report](https://www.reddit.com/r/mbta/comments/1xaqcns/comment/19rr8kfh46wlh/)
- [Public traffic dashboard](https://flbjcy.github.io/find-my-charlie/?traffic=1)
- [MBTA V3 API](https://api-v3.mbta.com/)

The timeline was reconstructed from the project and GitHub commit histories; the traffic and report totals were read from the live site at the stated time. The private archive contains fuller review evidence and dated report snapshots.
