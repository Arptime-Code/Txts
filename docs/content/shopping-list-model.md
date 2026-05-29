# How Variables Work (Shopping List Model)

> **Resources** · Last updated: May 2026

## The Model

Think of a txts variable as a **shopping list**.

Each line on the list is either:

- **A product you already have in hand** (like "2% milk") — just toss it in the cart
- **An IOU note** (like "see what's in Aisle 3") — you have to walk over to Aisle 3, grab whatever's sitting there, and put that in your cart instead

So every variable is a list of these lines, top to bottom. When you "read" the variable, you go through the list line by line and collect everything into your cart.

---

## How Reading the List Works

Start at the top. For each line:

- **Product you have** → put it in the cart as-is
- **IOU note to another aisle** → go to that aisle, read **that** aisle's list completely, put whatever you find into your cart, then come back and continue your original list

So if your list says:

1. "hello "
2. "see what's in result"
3. "!"

Then reading it means: put "hello " in the cart, go read the entire `result` list and dump it in, then put "!" in the cart.

If an IOU note points to an aisle that **doesn't exist yet** (the variable was never created), you just get nothing — skip it, no big deal.

If an IOU note points to an aisle that itself has IOU notes pointing to other aisles, you keep walking: Aisle 1 → Aisle 2 → Aisle 3, each one read and collected in turn.

If you ever end up going in circles (Aisle 1 says "see Aisle 2", Aisle 2 says "see Aisle 3", Aisle 3 says "see Aisle 1"), after **20 hops** the store manager steps in and throws an error — no infinite loops allowed.

---

## When Do You Read the List?

**Almost never upfront.** You just write the list (products and IOU notes) and leave it sitting there. Only when someone actually asks to read the variable (like when it's added to OUTPUT) do you walk the list.

The exception is `txts.OUTPUT` — that's the checkout counter. As soon as you ADD something to OUTPUT, it's bagged right then on the spot. There's no list for OUTPUT — it's just a bag of already-finished strings.

---

## ADD Copies Someone Else's List

When you do `ADD myList otherPerson` and that other person already has a written list, you **copy their entire list** into yours — every product and IOU note, line by line. Your list is now independent: if they later change their list, yours won't be affected.

But any **IOU notes inside the copy** are still active. If their list said "see Aisle 5", your copy also says "see Aisle 5" — and when you later read your list, you'll actually go to Aisle 5 and grab whatever's there. The copy is of the list's structure, not of the products sitting in the aisles.

If the other person **doesn't have a list yet**, you just write a single IOU note: "see that person's aisle" — a placeholder. When your list is read later, it'll go check that aisle. If the aisle was stocked by then, great. If not, you get nothing.

---

## REPLACE Reroutes Your IOU Notes

When you do `REPLACE Aisle3 Aisle7` (both are aisle numbers, not products):

1. Aisle3's own list is replaced with a single IOU note saying "see Aisle7"
2. Then a store employee goes through **every single shopping list in the entire store** and rewrites any "see Aisle3" note to say "see Aisle7" instead
3. Finally, Aisle3 is **torn out of the store directory** — anyone writing a new "see Aisle3" note after this point is pointing to a removed aisle, so they get nothing

So REPLACE between two aisles is a **one-time substitution**: all existing IOU notes are rerouted, and any new notes pointing to the old aisle will be dead ends.

When you do `REPLACE Aisle3 "whole milk"` (aisle and a product), no store-wide scan happens. Only Aisle3's list is replaced with a single product line saying "whole milk". Other lists that had "see Aisle3" still point to Aisle3 and will naturally find the milk.

---

## Quick Rules

- **IOU note to nowhere** → you get nothing, no error
- **ADD** copies the other person's list (snapshot of structure, IOU notes still work when read)
- **REPLACE aisle aisle** → reroutes all existing IOU notes + removes the old aisle
- **REPLACE aisle "product"** → just replaces that aisle's list, nothing else changes
- **OUTPUT** resolves immediately (checkout counter); everything else resolves when read
- **20 hops max** — going in circles hits the limit and errors out
