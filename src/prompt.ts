export function prompt(): string {
    
    function sample<T>(arr: T[], n: number): T[] {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]]; // Fisher–Yates shuffle
        }
        return result.slice(0, n);
    }

    const artistList: string[] = [
        "Joan Miro",
        "Juan Gris",
        "Mike Kelley",
        "Robert Rauschenberg",
        "Willem deKooning",
        "Cecily Brown",
        "Piet Mondrian",
        "Karel Appel",
        "Haim Steinbach",
        "Pablo Picasso",
        "Philip Guston",
        "Henry Moore",
        "Isamu Noguchi",
        "Alexander Calder",
        "Barbara Hepworth",
        "Jean Arp",
        "Leon Golub",
        "Jeff Koons",
        "Constant Nieuwenhuys",
        "Asger Jorn",
        "Jenny Saville",
        "Paul McCarthy",
        "Paul Klee",
        "Mark Rothko",
        "Wassily Kandinsky",
        "Franz Kline",
        "Jackson Pollock",
        "Barnett Newman",
        "Lee Krasner",
        "Helen Frankenthaler",
        "Cy Twombly",
        "David Smith",
        "Richard Serra",
        "Robert Smithson",
        "Donald Judd",
        "Sol LeWitt",
        "Dan Flavin",
        "Carl Andre",
        "Robert Morris",
        "Bridget Riley",
        "Kenneth Noland",
        "Frank Stella",
        "Ellsworth Kelly",
        "Agnes Martin",
        "Lucio Fontana",
        "Yves Klein",
        "Louise Bourgeois",
        "Eva Hesse",
        "Lynda Benglis",
        "Richard Tuttle",
        "Robert Mangold",
        "Robert Ryman",
        "Takashi Murata",
        "Georges Litaud",
        "Richard Diebenkorn"
    ]

    const speciesList: string[] = [
        "Agalychnis callidryas",
        "Dendrobates auratus",
        "Dendrobates tinctorius",
        "Hyalinobatrachium ruedai",
        "Dendrobates azureus",
        "Breviceps macrops",
        "Conraua goliath",
        "Theloderma corticale",
        "Nasikabatrachus sahyadrensis",
        "Pipa pipa",
        "Rhacophorus nigropalmatus",
        "Ceratophrys genus",
        "Litoria caruela, Dumpy tree frog"
    ]
    const qualitiesList: string[] = [
        "cute", 
        "simple", 
        "angry", 
        "devilish", 
        "smiling", 
        "fat",
        "cherubic"
    ]

    const firingStyles: string[] = [
        "raku-fired",
        "pit-fired",
        "soda-fired",
        "salt-fired",
        "oxidation fired",
        "reduction fired",
        "bisque-fired",
        "wood-fired"
    ]

    const randomQuality: string[] = [
        "lapis lazuli",
        "photochromatic",
        "moiré",
        "interference pattern",
        "Venus of Willendorf",
        "8x8-Bayer-Matrix Dithering",
        "mise en abyme",
        "tomato",
        "Azurite",
        "strawberry",
        "risograph print",
        "Hermann grid illusion",
        "Mach bands",
        "Troxler's fading",
        "chromostereopsis",
        "afterimages",
        "autokinetic effect",
        "Wundt illusion",
        "Hering illusion",
        "Novaya Zemlya effect"
    ]

    const artists: string[] = sample(artistList, 2)

    return `a small ${sample(qualitiesList, 1)} ceramic frog souvenir, ${sample(firingStyles, 1)}, ${sample(speciesList, 1)}, highly textured Xerox scan of an archival museum catalog, textured white background, ${artists[0]}, full-color photograph, ${artists[1]}, ${sample(randomQuality, 1)}  --no nostrils, holes, black circles, text, base, plinth  --stylize 750 --v 3`;
}