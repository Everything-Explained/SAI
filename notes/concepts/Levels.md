If SAI is tasked with answering questions, then it stands to reason that certain information may be sensitive. A developer might want to create arbitrary access restrictions for certain sensitive information; this can be done using the [[Repository Item#Level|Level Property]].

## Levels vs Priority
In general, most people would consider *level 1* to be the first level, but in certain systems we could use the concept of priority, which would make 1 the highest level. It is ultimately the developers choice; you could even come up with an entirely unique classification system with its own numbering scheme.

The following table illustrates how each system is similar but different:

Degree |Level | Priority
------|------|---------
low | 0 | 8
-| 1 | 7
-| 2 | 6
-| 3 | 5
med | 4 | 4
-| 5 | 3
-| 6 | 2
-| 7 | 1
high | 8 | 0

The illustration above showcases how the level system can be used, however the numbers are entirely subjective. You're allowed to have theoretically as high a value or as low a value as is necessary for your use-case. There are no constraints other than they should not exceed the [[Repository Item#Level|inherent restrictions]] with **int32** values.

> I can't imagine a use-case that would need a *level* or *priority* outside the bounds of an **int32** value.