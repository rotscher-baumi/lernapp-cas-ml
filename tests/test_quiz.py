"""Quiz chapter: card ids, Leitner rating, mixed rounds and statistics of LernApp.quizLogic (assets/demos-quiz.js)."""

import json
import shutil
import subprocess
from typing import Any

import pytest
from conftest import ROOT

HARNESS = ROOT / "tests" / "quiz_harness.js"
pytestmark = pytest.mark.skipif(shutil.which("node") is None, reason="Node.js is not installed")
TODAY = "2026-11-22"


def _call(fn: str, *args: Any, seed: int | None = None) -> Any:  # noqa: ANN401 (JSON from the harness)
    """Run one function of ``LernApp.quizLogic`` in Node.

    :param fn: name of the function.
    :param args: its arguments, passed as JSON.
    :param seed: fixed random sequence for ``interleave`` and ``queue``.
    :return: the return value, decoded from JSON.
    """
    payload: dict[str, Any] = {"fn": fn, "args": list(args)}
    if seed is not None:
        payload["seed"] = seed
    result = subprocess.run(
        ["node", str(HARNESS)], input=json.dumps(payload), capture_output=True, text=True, check=False
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def _modules() -> list[dict[str, Any]]:
    return [
        {"id": "ml", "nav": "Supervised ML", "quiz": [{"q": f"ml {i}?", "a": "a"} for i in range(5)]},
        {"id": "nn", "nav": "NN", "quiz": [{"q": f"nn {i}?", "a": "a"} for i in range(3)]},
        {"id": "cv", "nav": "CV", "quiz": [{"q": "cv <b>0</b>?", "a": "a"}]},
    ]


def test_card_ids_come_from_the_german_question() -> None:
    english = {"id": "ml", "quiz": [{"q": "Why?", "a": "Because."}], "quizDe": [{"q": "Warum?", "a": "Darum."}]}
    german = {"id": "ml", "quiz": [{"q": "Warum?", "a": "Darum."}]}
    assert _call("collect", [english])[0]["id"] == _call("collect", [german])[0]["id"]
    assert _call("collect", [english])[0]["q"] == "Why?"


def test_card_ids_ignore_markup_and_spacing_and_stay_unique() -> None:
    a = _call("collect", [{"id": "x", "quiz": [{"q": "Was ist <code>fit</code>?", "a": ""}]}])[0]["id"]
    b = _call("collect", [{"id": "x", "quiz": [{"q": "Was  ist fit?", "a": ""}]}])[0]["id"]
    assert a == b
    twice = _call("collect", [{"id": "x", "quiz": [{"q": "Q?", "a": "1"}, {"q": "Q?", "a": "2"}]}])
    assert len({c["id"] for c in twice}) == 2


def test_every_chapter_question_gets_a_distinct_id() -> None:
    cards = _call("collect", _modules())
    assert len(cards) == 9
    assert len({c["id"] for c in cards}) == 9


@pytest.mark.parametrize(
    ("card", "grade", "box", "due"),
    [
        (None, "good", 2, "2026-11-25"),
        (None, "hard", 1, "2026-11-23"),
        (None, "again", 1, "2026-11-23"),
        ({"box": 1, "seen": 1}, "good", 2, "2026-11-25"),
        ({"box": 3, "seen": 4}, "hard", 3, "2026-11-29"),
        ({"box": 4, "seen": 4}, "again", 1, "2026-11-23"),
        ({"box": 5, "seen": 9}, "good", 5, "2026-12-22"),
    ],
)
def test_rating_moves_the_card_between_the_boxes(card: dict | None, grade: str, box: int, due: str) -> None:
    new = _call("rate", card, grade, TODAY)
    assert (new["box"], new["due"], new["last"]) == (box, due, TODAY)
    assert new["seen"] == (card["seen"] if card else 0) + 1


def test_dates_cross_month_and_year_ends() -> None:
    assert _call("addDays", "2026-12-25", 14) == "2027-01-08"
    assert _call("daysBetween", "2026-11-22", "2027-01-08") == 47


def test_round_has_all_due_cards_and_a_limited_number_of_new_ones() -> None:
    cards = _call("collect", _modules())
    state = {
        "cards": {
            cards[0]["id"]: {"box": 2, "due": "2026-11-20"},
            cards[1]["id"]: {"box": 2, "due": TODAY},
            cards[2]["id"]: {"box": 3, "due": "2026-11-30"},
        }
    }
    q = _call("queue", cards, state, TODAY, {"chapters": None, "newMax": 3}, seed=1)
    ids = [c["id"] for c in q]
    assert cards[0]["id"] in ids
    assert cards[1]["id"] in ids
    assert cards[2]["id"] not in ids
    assert len(ids) == 5
    new = [c for c in q if c["id"] not in state["cards"]]
    assert {c["ch"] for c in new} == {"ml", "nn", "cv"}, "new cards are taken from every chapter in turn"


def test_round_keeps_to_the_chosen_chapters() -> None:
    cards = _call("collect", _modules())
    q = _call("queue", cards, {"cards": {}}, TODAY, {"chapters": ["nn"], "newMax": -1}, seed=2)
    assert [c["ch"] for c in q] == ["nn"] * 3


def test_mixed_round_never_repeats_a_chapter_while_others_are_left() -> None:
    cards = _call("collect", _modules())
    for seed in range(1, 6):
        order = [c["ch"] for c in _call("interleave", cards, None, seed=seed)]
        assert sorted(order) == sorted(c["ch"] for c in cards)
        # 5 ml, 3 nn, 1 cv: the four others are just enough to separate the five ml cards
        assert all(a != b for a, b in zip(order, order[1:], strict=False)), order


def test_statistics_count_new_boxes_and_due_per_chapter() -> None:
    cards = _call("collect", _modules())
    state = {"cards": {cards[0]["id"]: {"box": 1, "due": TODAY}, cards[6]["id"]: {"box": 4, "due": "2026-11-24"}}}
    st = _call("stats", cards, state, TODAY)
    ml, nn, cv = st["rows"]
    assert (ml["ch"], ml["n"], ml["neu"], ml["box"], ml["due"]) == ("ml", 5, 4, [1, 0, 0, 0, 0], 1)
    assert (nn["neu"], nn["box"], nn["due"]) == (2, [0, 0, 0, 1, 0], 0)
    assert cv["neu"] == 1
    assert (st["total"]["n"], st["total"]["neu"], st["total"]["due"]) == (9, 7, 1)
    assert _call("upcoming", cards, state, TODAY, 7) == [0, 1, 0, 0, 0, 0, 0]


@pytest.mark.parametrize("stored", [None, "", "{oops", {"v": 2, "cards": {"x": 1}}, {"v": 1, "cards": []}])
def test_unreadable_state_starts_empty(stored: object) -> None:
    s = _call("parse", stored)
    assert (s["cards"], s["blank"], s["drafts"], s["filter"], s["newMax"]) == ({}, {}, {}, None, 10)


def test_stored_state_is_kept() -> None:
    stored = {"v": 1, "cards": {"ml:1": {"box": 2, "due": TODAY}}, "filter": ["ml"], "newMax": -1}
    s = _call("parse", stored)
    assert (s["cards"], s["filter"], s["newMax"]) == (stored["cards"], ["ml"], -1)


def test_every_main_page_chapter_question_has_a_card() -> None:
    """The real chapters: all questions on the main page become cards with distinct ids."""
    script = (
        "global.window=global;const L=global.LernApp={demos:{},modules:[],t:(a)=>a,"
        "register:(m)=>{if(m.quiz)m.quizDe=m.quiz;L.modules.push(m)},translate:()=>{}};"
        "const fs=require('fs');"
        "const index=fs.readFileSync('index.html','utf8');"
        'const src=[...index.matchAll(/src="(assets\\/[^"]+|modules\\/[^"/]+)\\.js"/g)].map((m)=>m[1]+\'.js\')'
        ".filter((f)=>!/core|search/.test(f));"
        "const stub=new Proxy(function(){return ''},{get:(t,k)=>k==='prototype'?{}:stub,apply:()=>''});"
        "global.document=stub;global.KMeansDemo=stub;global.MatheDemos=stub;"
        "L.nnFlow=L.nnConcept=()=>'';L.detFig=L.genFig=stub;L.$=()=>null;L.fmt=(v)=>String(v);"
        "for(const f of src){try{eval(fs.readFileSync(f,'utf8'))}catch(e){}}"
        "const n=L.modules.reduce((a,m)=>a+(m.quiz||[]).length,0);"
        "const ids=L.quizLogic.collect(L.modules).map((c)=>c.id);"
        "process.stdout.write(JSON.stringify({n,ids:ids.length,unique:new Set(ids).size,"
        "quiz:L.modules.some((m)=>m.id==='quiz')}))"
    )
    result = subprocess.run(["node", "-e", script], cwd=ROOT, capture_output=True, text=True, check=False)
    assert result.returncode == 0, result.stderr
    out = json.loads(result.stdout)
    assert out["quiz"], "index.html does not load the quiz chapter"
    assert out["n"] > 100
    assert out["ids"] == out["unique"] == out["n"]
