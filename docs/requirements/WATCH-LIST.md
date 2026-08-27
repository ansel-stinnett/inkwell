# Requirements Watch List

| Requirement | Watch for | Status as of Lecture 3 |
|---|---|---|
| US-03's negotiated MVP scope: plain-text editing only for the first version. | Feedback from the Author that plain-text editing is not good enough. This has not happened yet and is only a real concern once it does. | No signal yet. Keep watching once Lectures 6 and 7 ship. |
| Register and Login non-enumeration extensions: the system must not reveal which emails are already registered. | Any future feature that breaks this rule by accident, such as a "check if email exists" endpoint, which would leak information it shouldn't. | Clear for now. No such endpoint exists yet. |
| Post behavioral model: the states a Post can be in. | Any future feature that assumes a Post state not shown in this model. Comments are one example. | Open. The Comment feature's own model has not been written yet. |
