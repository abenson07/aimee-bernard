# Photos to upscale (for the AI upscaler later)

Rule used: a photo needs upscaling when its source width is below **2x the width it is shown at** on a 1440px desktop (sharp on retina screens). "Target" is the width to upscale to. Originals live in `images/` (not committed); site assets are in `web/`.

## Needs upscaling

| Photo | Where it shows | Source | Shown at | Target | Factor |
|---|---|---|---|---|---|
| `images/SCI COMM TEDx front stage.jpg` | Communicator hero, big photo (right) | 1160 x 1720 | ~912 wide | 1900 wide | 1.7x |
| `web/src/assets/site/aimee-bw.png` (black-and-white TEDx portrait) | Educator, Communicator and Immunologist hero (small photo); Communicator and Educator cards | 520 x 826 | 448 wide | 900 wide | 1.8x |
| `web/src/assets/site/tedx-talk.jpg` (also the TEDx image in Sanity) | Communicator TEDx section, Contact | 1280 x 720 | ~1144 wide | 2300 wide | 1.8x |
| `images/HI3 fun size candy bag.png` | Educator, Human Immunology panel | 984 x 692 | ~658 wide | 1320 wide | 1.35x |
| `images/Aimee Pugh Bernard-444.png` | Contact portrait | 1110 x 1456 | ~680 wide | 1360 wide | 1.25x |
| `web/public/site/immunologist.webp` (stock) | Immunologist hero, Home hover (until replaced) | 1024 x 576 | ~912 wide | 1830 wide | 1.8x (stock: replace instead) |
| `web/public/site/educator.webp` (stock) | still used on Immunologist hero and other places | 1280 x 704 | ~912 wide | 1830 wide | 1.4x (stock: replace instead) |
| Immunologist hover photo (lab-coat composite, not made yet) | Home hover, Immunologist hero | n/a | full screen (1440) | 2880 wide | make large from the start |

## Borderline (fine for now)
| Photo | Source | Shown at | Note |
|---|---|---|---|
| `images/TLaS Aimee Ask a Q.png` | 1148 x 938 | up to 562 wide | OK |
| `web/src/assets/site/aimee-hero.png` (Home portrait) | 1040 x 1652 | ~700 wide, 900 tall | slightly low for the largest screens |
| `images/SCI COMM DMRSEF Aimee.jpg` | 1862 x 1192 | ~658 wide | OK |
| `images/CCTSI.png` | 2118 x 1206 | not placed yet | OK |
| `images/EDU THC Cells.jpg` | 1348 x 762 | not placed yet | low if used large |

## Plenty of resolution (no upscaling)
EDU THC Antibody (5301 x 3534), EDU THC Thymus (5395 x 3597), SCI COMM TEDx scientist (3548 x 5449), TTP Aimee (2048 x 1152), FUNSIZE IG collage (1966 x 1164), SUBSTACK collage (1836 x 1156), Immune Textbook (2316 x 3088).

When a photo is upscaled, drop the new file in `images/`, tell me, and I'll regenerate its WebP versions.

# Which photo shows where (current build)

| Page and place | Desktop | Phone |
|---|---|---|
| Home, hover Educator | EDU THC Antibody (2400px WebP) | same |
| Home, hover Immunologist | stock lab photo (waiting for her new photo) | same |
| Home, hover Communicator | TEDx scientist (on stage) | same |
| Home, What Aimee's Working On | TLaS Ask a Q, FUNSIZE IG collage, TTP Aimee, SUBSTACK collage | same |
| Educator, hero | left big: EDU THC Antibody; right small: b/w TEDx portrait | big photo only |
| Educator, course panels | Med and Grad: Antibody; PA and Dental: Thymus; Human Immunology: fun-size bag; CU Denver: DMRSEF | same |
| Communicator, hero | left small: b/w TEDx portrait; right big: TEDx front stage | big photo only (TEDx front stage) |
| Communicator, TEDx section | TEDx talk image (1280px, Sanity) | same |
| Contact | Aimee Pugh Bernard-444 (vest portrait) | same |
| Immunologist, hero | stock photo + b/w TEDx portrait | big photo only |
