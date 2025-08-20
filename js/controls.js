logDebug('js/controls.js loaded.');

// --- STATE ---
let keys = {};

// --- PRIVATE HELPERS ---
function getTouchPos(canvas, touch) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

function isInside(pos, button, scale) {
    return pos.x > button.x * scale &&
           pos.x < (button.x + button.width) * scale &&
           pos.y < (button.y + button.height) * scale &&
           pos.y > button.y * scale;
}

// --- EVENT HANDLERS ---
// Note: handleKeyDown and handleKeyUp are not used by the new initialize function,
// but are kept here in case they are useful later.
function handleKeyDown(e) {
    keys[e.code] = true;
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

function handleTouches(e, canvas, state) {
    e.preventDefault();
    const touchControls = state.touchControls;
    Object.keys(touchControls).forEach(k => keys[touchControls[k].key] = false);
    for (let i = 0; i < e.touches.length; i++) {
        const pos = getTouchPos(canvas, e.touches[i]);
        for (const key in touchControls) {
            if (isInside(pos, touchControls[key], state.scale)) {
                keys[touchControls[key].key] = true;
            }
        }
    }
}

// --- PUBLIC API ---
const Controls = {
    keys: keys,

    // The engine will call this to set up the listeners
    initialize: function(canvas, state, callbacks) {
        logDebug('Controls.initialize called.');
        window.addEventListener('keydown', e => {
            keys[e.code] = true;
            if (callbacks.onAction) callbacks.onAction(e.code);
        });
        window.addEventListener('keyup', e => {
            keys[e.code] = false;
        });

        const touchHandler = (e) => handleTouches(e, canvas, state);

        canvas.addEventListener('touchstart', touchHandler, { passive: false });
        canvas.addEventListener('touchmove', touchHandler, { passive: false });

        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            // Find tap position for UI buttons
            const touch = e.changedTouches[0];
            if (touch && callbacks.onTap) {
                const pos = getTouchPos(canvas, touch);
                callbacks.onTap(pos);
            }
            // Reset keys
            Object.keys(state.touchControls).forEach(k => keys[state.touchControls[k].key] = false);
        }, { passive: false });

        canvas.addEventListener('click', e => {
            if (callbacks.onTap) {
                const clickPos = { x: e.offsetX, y: e.offsetY };
                callbacks.onTap(clickPos);
            }
        });
        logDebug('Controls initialized.');
    }
};
