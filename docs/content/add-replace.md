# ADD & REPLACE Basics

How ADD and REPLACE work — explained through a grocery trip analogy.

---

### ADD — Writing "milk" on your list

```txts
ADD myCart.list "milk"
```

You write **"milk"** on your shopping list. It's a fixed item — you know exactly what it is. It goes on the list *right now*.

**Shopping list:** `[milk]`

---

### ADD — Referencing your partner's list

```txts
ADD myCart.list myPartner.list
```

Your partner has their own list in their pocket. You **check right now** what's on it. It says *"eggs"* — so you copy **"eggs"** onto your list. If they add *"bread"* later, that's their problem — you already copied "eggs".

*→ Eager resolve: partner's list exists, so grab its value now.*

**Shopping list:** `[milk, eggs]`

> [!TIP]
> **What if your partner hasn't written a list yet?**
> There's no list to copy from — it doesn't exist yet. You can't grab anything right now. So you write a **note to yourself**: *"ask partner when they show up"*. Later, when they write "bread", your note resolves — a *forward reference* that picks up the value once the list exists.

---

### ADD — Announcing your list (OUTPUT)

```txts
ADD txts.OUTPUT myCart.list
```

You **announce** what's on your list to the group. You read it out loud *right now*. What you say is what's on the list at this exact moment. If someone adds something later, the announcement won't change — it already happened.

*→ OUTPUT resolves immediately. No taking back what you said.*

**If your list references another list you don't know yet** — like your partner's list that you haven't seen — then your announcement will produce **no output** for that reference. OUTPUT can't wait for something that isn't there yet. It says what it knows, *now*.

**Announcement (partner's list unknown):** `"milk"` *(only your own items, nothing for the unknown reference)*

**Announcement (partner has eggs):** `"milk, eggs"`

---

### REPLACE — Tearing up and rewriting a list

```txts
REPLACE myPartner.list "butter"
```

Your partner tears up their old list and writes a **brand new list** with just one item: *"butter"*. Whatever was there before is gone. Anyone who looks at their list later will see **"butter"**.

*→ REPLACE var "text" replaces the whole chain with a fixed value.*

**Partner's list:** `[butter]`

---

### REPLACE — Redirecting your list to your partner's

```txts
REPLACE myCart.list myPartner.list
```

You tear up your own list and put a **sticky note** in its place: *"see partner's list instead"*. From now on, whenever anyone asks what's on *your* list, you look at **your partner's list** instead.

If your partner later changes their list, your list automatically reflects that change — because your list is just a pointer to theirs.

*→ REPLACE var1 var2 redirects var1 to var2.*

**My list:** `[→ partner's list → butter]`

---

### Key insight — Chain vs OUTPUT

```txts
# Building into a chain
ADD myChain.list "apples"
ADD myChain.list myFriend.list  # forward ref if friend hasn't written yet
ADD myFriend.list "bananas"            # now friend has something
ADD txts.OUTPUT myChain.list              # resolves chain → "applesbananas"
```

You keep a **working list** in your pocket. You write "apples". Your friend hasn't written their list yet, so you leave a note: *"check friend later"*. Your friend writes "bananas". Now you read your list out loud: "apples" + (check friend) → "bananas" → **"applesbananas"**.

*→ Chain variables let you store forward refs that resolve later.*

**Announcement:** `"applesbananas"`

> [!TIP]
> **Compare with writing directly to OUTPUT:**
> If you had announced "apples" before your friend wrote anything, then later tried to announce their list — you'd get nothing, because their list didn't exist yet at announcement time. OUTPUT doesn't wait. It says what it sees, now.
