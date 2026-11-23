# 🪎 Schatzsuche – eigene Suche für NotePlan

Eine Suchansicht für die Seitenleiste von [NotePlan](https://noteplan.co). Suchwort tippen, Enter drücken, jede passende Zeile sehen und die Notiz mit einem Klick öffnen.

[English](README.md)

## Funktionen

- **Treffer sofort in der Seitenleiste**: jede passende Zeile mit ihrer Überschrift, nach Notizen gruppiert.
- **Öffnen mit einem Klick**: ⌥-Klick öffnet die Notiz in der geteilten Ansicht und nutzt sie wieder, ⌘-Klick öffnet ein neues Fenster. Oder mit ↑↓ und Enter.
- **Schnellsuchen als Knöpfe**: ganzes Wort, nur Notizen, Tagebuch 30 Tage, ohne Aufgaben, unter Überschrift, offene Aufgaben, erledigt in 30 Tagen, neueste zuerst, dein Schatz-Tag.
- **Filter** nach Datum, Überschrift, Ordner und Zeilenart (siehe Suchsyntax).
- **Schatzkiste**: Treffer über mehrere Suchen hinweg ankreuzen und als Markdown speichern: als neue Notiz, in die heutige Tagesnotiz oder in die Zwischenablage.
- **Raindrop.io (optional)**: Lesezeichen neben den Notizen durchsuchen, mit Favoriten und Wiedervorlage.
- **Übernimmt dein NotePlan-Theme**, hell und dunkel.
- **Deutsch und Englisch**: Die Sprache folgt dem System oder wird in den Einstellungen gewählt.

## Installation

1. NotePlan öffnen.
2. **Settings › Plugins** öffnen.
3. Nach **«Schatzsuche»** suchen.
4. **Install** klicken.
5. **Schatzsuche** in der linken Seitenleiste öffnen.

Der normale Weg ist die Seitenleiste. Der Befehl **/🪎 Schatzsuche** (`/schatz` tippen oder ⌘J) öffnet dieselbe Ansicht im Hauptfenster. Das hilft, wenn die Seitenleiste ausgeblendet ist, und auf iPhone und iPad.

Zeigt die Seitenleiste nach einem Update ein altes Symbol: In **Settings › Plugins** die Details des Plugins öffnen und **Sidebar** einmal aus- und wieder einschalten.

Ab NotePlan 3.21. Getestet auf dem Mac. iPhone und iPad sollten funktionieren, sind aber noch nicht getestet.

## Suchsyntax

| Eingabe | Findet |
|---|---|
| `kunde angebot` | Zeilen mit allen Wörtern |
| `"wort"` | das ganze Wort oder die Phrase |
| `pos*e` `poli?e` | Platzhalter: `*` beliebig viele Zeichen, `?` ein Zeichen |
| `-entwurf` `-#tag` | ausschließen |
| `#tag` `@person` | Tag, Erwähnung |
| `in:notizen` `in:kalender` `in:archiv` | Bereich |
| `ordner:Kunden` | Ordner (Teilname) |
| `ist:offen` `ist:erledigt` `ist:aufgabe` `ist:keine-aufgabe` | Zeilenart |
| `überschrift:Ideen` | Zeilen unter einer passenden Überschrift |
| `seit:14d` `seit:woche` `seit:monat` `seit:jahr` `seit:2026-09-01` | Datum der Tagesnotiz bzw. letzte Änderung |

Die englischen Schlüsselwörter funktionieren ebenso: `in:notes`, `folder:`, `is:open`, `heading:`, `since:week`.

## Einstellungen

NotePlan › **Settings › Plugins › Schatzsuche** (Zahnrad):

- **Sprache**: auto, English oder Deutsch.
- **Schatz-Tag**: der Tag, mit dem du Schätze markierst, z. B. `#schatz`. Zwei Schnellsuchen nutzen ihn.
- **Raindrop-Token**: optional, siehe unten.

## Optional: Raindrop.io

1. In Raindrop.io unter **Settings › Integrations** eine App anlegen und ihren **Test-Token** kopieren.
2. In der Einstellung **Raindrop token** einfügen.
3. Die Raindrop-Knöpfe erscheinen. Suche mit `in:raindrop`, dazu Raindrop-Operatoren wie `link:beispiel.de`, `type:article`, `important:true`, `reminder:true`.

Der Token wird nur gelesen, nie angezeigt oder protokolliert. Die Volltextsuche braucht Raindrop Pro.

### Lesezeichen aufbereiten

Eine Suche findet nur, was Wörter hat. Ich lasse meine Lesezeichen von **Stella**, der KI von Raindrop, mit einem eigenen Prompt kuratieren. Was sich bewährt hat:

- **Neue, sprechende Titel** mit der Autorin oder dem Autor in Klammern. Der Originaltitel bleibt in der Beschreibung, damit du den Beitrag auch über die Worte findest, an die du dich erinnerst.
- **Eine Zeile «K wie Kreativmethoden»**: Buchstabe und Schlüsselbegriff, dazu höchstens zwei weitere Begriffe. Das ergibt ein ABC über alle Quellen.
- **Zwei oder drei kurze Punkte**, warum sich der Beitrag lohnt. Keine Nacherzählung.
- **Ehrlichkeitsregel**: Konnte nur ein Teaser gelesen werden, das offen sagen und nichts erfinden.
- **Tags nur für Zustände, nicht für Themen**: `#clutter` (ohne bleibenden Wert: ausblenden, nicht löschen), `#teaser` (später lesen). Themen findet die Volltextsuche.
- **Datum**: Bei LinkedIn-Beiträgen steckt der Zeitpunkt der Veröffentlichung im Link: `urn:li:activity:<Zahl>`, Zahl >> 22 = Millisekunden seit 1970.
- **Filter ist Sicht, Ordner ist Ort**: `link:`-Filter für Quellen, die sagen, was etwas ist (eine Zeitschrift), Ordner für das, worum es geht.

## So habe ich es erweitert (nicht Teil des Plugins)

Meine eigene Fassung durchsucht auch Simplenote, Gmail-Nachrichten mit Stern (über ein kleines Google Apps Script und meinen eigenen Server), Dateien und Ordner mit Finder-Tags (eine Markdown-Notiz je Datei) und meinen LinkedIn-Datenexport. Diese Teile hängen an meiner eigenen Umgebung und sind darum nicht im Plugin. Bei Interesse gern ein Issue eröffnen.

## Support

Bereitgestellt wie es ist. Issues sind willkommen, eine Antwortzeit ist nicht zugesagt.

## Lizenz

MIT – siehe [LICENSE](LICENSE).
