const level2Data = {
    "title": "Quanti e la Missione dell’Invisibile - Livello 2",
    "nextLevel": "level3.html",
    "character": "Quanti",
    "unlockedAbilities": ["doubleJump"],
    "physics": {
        "gravity": 0.6,
        "jumpStrength": -15,
        "doubleJumpStrength": -22,
        "quantumJumpStrength": -28
    },
    "background": {
        "type": "atomic",
        "color": "#101020"
    },
    "platforms": {
        "count": 10,
        "initialX": 200,
        "gap": [300, 400],
        "yRange": [150, 300],
        "widthRange": [80, 130],
        "goalPlatform": {
            "y": 300,
            "width": 100,
            "height": 100
        }
    },
    "enemies": {
        "type": "electrons",
        "interval": 120,
        "speedRange": [2, 4]
    },
    "quanta": {
        "offsetY": -40,
        "width": 15,
        "height": 15
    },
    "ui": {
        "startScreen": {
            "title": "Quanti e la Missione dell’Invisibile",
            "subtitle1": "Il malvagio Dr. Clàsikon vuole rendere l'universo noioso e prevedibile!",
            "subtitle2": "Aiuta Quanti, il fotone con il jetpack, a salvare il Regno dell'Invisibile!",
            "levelTitle": "Livello 2: Caos Atomico",
            "instructions": "Schiva le meteoriti di elettroni e salta tra gli atomi!",
            "buttonText": "Inizia la Missione!"
        },
        "completeScreen": {
            "title": "Livello Superato!",
            "subtitle": "Hai compiuto un altro Salto Quantico!",
            "message1": "Proprio come hai saltato da un atomo all'altro, un elettrone può 'saltare' da un'orbita all'altra assorbendo energia.",
            "message2": "Non può esistere a metà strada! Questo è uno dei misteri fondamentali del mondo quantico. Missione compiuta!",
            "buttonText": "Vai al Livello 3"
        }
    },
    "audio": {}
};
