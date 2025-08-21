const level1Data = {
    "title": "Quanti e la Missione dell’Invisibile - Livello 1",
    "nextLevel": "level2.html",
    "character": "Quanti",
    "physics": {
        "gravity": 0.5,
        "jumpStrength": -12,
        "doubleJumpStrength": -18,
        "quantumJumpStrength": -25
    },
    "background": {
        "type": "starfield",
        "color": "#000010"
    },
    "platforms": {
        "layout": [
            { "x": 200, "y": 100, "width": 250, "height": 20 },
            { "x": 500, "y": 200, "width": 250, "height": 20 },
            { "x": 800, "y": 300, "width": 250, "height": 20 },
            { "x": 1100, "y": 250, "width": 250, "height": 20 },
            { "x": 1400, "y": 150, "width": 250, "height": 20 },
            { "x": 1700, "y": 200, "width": 120, "height": 20, "goal": true }
        ]
    },
    "enemies": null,
    "powerUps": [
        { "type": "doubleJump", "x": 925, "y": 350 }
    ],
    "quanta": {
        "offsetY": -30,
        "width": 10,
        "height": 10
    },
    "ui": {
        "startScreen": {
            "title": "Quanti e la Missione dell’Invisibile",
            "subtitle1": "Una forza misteriosa sta appiattendo l'universo!",
            "subtitle2": "Impara i fondamenti del salto quantico per prepararti alla sfida.",
            "levelTitle": "Livello 1: I Primi Salti",
            "instructions": "Colleziona energia per eseguire un Salto Quantico e raggiungere la fine.",
            "buttonText": "Inizia l'Addestramento"
        },
        "completeScreen": {
            "title": "Addestramento Completato!",
            "subtitle": "Hai imparato a controllare l'energia quantica!",
            "message1": "Ora sei pronto per sfide più grandi.",
            "message2": "Il Regno dell'Invisibile conta su di te!",
            "buttonText": "Vai al Livello 2"
        }
    },
    "audio": {}
};
