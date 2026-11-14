--------------------------- MODULE DgInstaller ---------------------------
EXTENDS Naturals, Sequences, FiniteSets, TLC

CONSTANTS Agents, Assets, Comic

VARIABLES installed, result

vars == <<installed, result>>

Init ==
    /\ installed = [a \in Agents |-> {}]
    /\ result = "idle"

Install(a) ==
    /\ a \in Agents
    /\ installed' = [installed EXCEPT ![a] = Assets]
    /\ result' = "installed"

Inspect(a) ==
    /\ a \in Agents
    /\ UNCHANGED installed
    /\ result' = IF installed[a] = Assets THEN "complete" ELSE "incomplete"

Next == \E a \in Agents : Install(a) \/ Inspect(a)

TypeOK ==
    /\ installed \in [Agents -> SUBSET Assets]
    /\ result \in {"idle", "installed", "complete", "incomplete"}

CompleteOrEmpty == \A a \in Agents : installed[a] = {} \/ installed[a] = Assets

ComicWithSkill ==
    \A a \in Agents : installed[a] # {} => Comic \in installed[a]

BadTypeInstall(a) ==
    /\ a \in Agents
    /\ installed' = [installed EXCEPT ![a] = Assets]
    /\ result' = "unknown"

BadPartialInstall(a) ==
    /\ a \in Agents
    /\ installed' = [installed EXCEPT ![a] = {Comic}]
    /\ result' = "installed"

BadComicInstall(a) ==
    /\ a \in Agents
    /\ installed' = [installed EXCEPT ![a] = Assets \ {Comic}]
    /\ result' = "installed"

NextBreaksTypeOK == \E a \in Agents : BadTypeInstall(a) \/ Inspect(a)
NextBreaksCompleteOrEmpty == \E a \in Agents : BadPartialInstall(a) \/ Inspect(a)
NextBreaksComicWithSkill == \E a \in Agents : BadComicInstall(a) \/ Inspect(a)

=============================================================================
