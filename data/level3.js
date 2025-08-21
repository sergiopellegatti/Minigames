const level3Data = {
    "title": "Quanti e la Missione dell’Invisibile - Livello 3",
    "nextLevel": null, // This is the last level for now
    "character": "Quanti",
    "unlockedAbilities": ["doubleJump"],
    "physics": {
        "gravity": 0.5,
        "jumpStrength": -12,
        "doubleJumpStrength": -18,
        "quantumJumpStrength": -25
    },
    "background": {
        "type": "starfield",
        "color": "#200020" // A new purplish color
    },
    "platforms": {
        "layout": [
            { "x": 200, "y": 100, "width": 250, "height": 20 },
            { "x": 550, "y": 150, "width": 250, "height": 20 },
            { "x": 900, "y": 200, "width": 250, "height": 20 },
            { "x": 1250, "y": 250, "width": 250, "height": 20 },
            { "x": 1600, "y": 300, "width": 250, "height": 20 },
            { "x": 1950, "y": 250, "width": 120, "height": 20, "goal": true }
        ]
    },
    "enemies": null,
    "powerUps": [
        { "type": "split", "x": 625, "y": 125 }
    ],
    "doors": [
        { "x": 700, "y": 225, "width": 20, "openingHeight": 200, "speed": 0.5, "state": "closing" },
        { "x": 1450, "y": 225, "width": 20, "openingHeight": 100, "speed": 1, "state": "closing" }
    ],
    "quanta": {
        "offsetY": -30,
        "width": 10,
        "height": 10
    },
    "ui": {
        "startScreen": {
            "title": "Quanti e la Missione dell’Invisibile",
            "subtitle1": "Il tessuto dello spazio-tempo si sta comportando in modo strano...",
            "subtitle2": "Attraversa le porte misteriose per capire cosa sta succedendo!",
            "levelTitle": "Livello 3: La Doppia Porta Misteriosa",
            "instructions": "Le porte si aprono e si chiudono. Trova il modo di passare!",
            "buttonText": "Inizia l'Esplorazione"
        },
        "completeScreen": {
            "title": "Mistero Risolto!",
            "subtitle": "Hai padroneggiato il dualismo onda-particella!",
            "message1": "Proprio come Quanti può essere in due posti contemporaneamente, una particella può esistere come un'onda di probabilità.",
            "message2": "Hai salvato il Regno Quantico dalla noia della certezza! Missione compiuta!",
            "buttonText": "Hai completato il gioco! Rigioca"
        }
    }
};
