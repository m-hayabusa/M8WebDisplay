// Copyright 2021 James Deery
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Settings from './settings.js';

const keyMap = Object.freeze({
    Tab: -2,
    ShiftLeft: -1,
    KeyZ: 0,
    KeyS: 1,
    KeyX: 2,
    KeyD: 3,
    KeyC: 4,
    KeyV: 5,
    KeyG: 6,
    KeyB: 7,
    KeyH: 8,
    KeyN: 9,
    KeyJ: 10,
    KeyM: 11,
    Comma: 12,
    KeyL: 13,
    Period: 14,
    Semicolon: 15,
    Slash: 16,

    Escape: -1 + 12,
    KeyQ: 0 + 12,
    Digit1: 1 + 12,
    KeyW: 2 + 12,
    Digit2: 3 + 12,
    KeyE: 4 + 12,
    KeyR: 5 + 12,
    Digit4: 6 + 12,
    KeyT: 7 + 12,
    Digit5: 8 + 12,
    KeyY: 9 + 12,
    Digit6: 10 + 12,
    KeyU: 11 + 12,
    KeyI: 12 + 12,
    Digit8: 13 + 12,
    KeyO: 14 + 12,
    Digit9: 15 + 12,
    KeyP: 16 + 12,
    Backslash: 17 + 12,
    Backspace: 19 + 12,

    BracketLeft: 'velDown',
    BracketRight: 'velUp',
    Minus: 'octDown',
    Equal: 'octUp',
    ShiftRight: 'shiftKey'
});

let connection;
let enabled = true;
let transpose = 36;
let vel = 103;
let currentKey = null;
let isShiftKeyDown = false;

export function handleKey(input, isDown, e) {
    if (!enabled || !e || e.ctrlKey || e.metaKey || e.altKey)
        return false;

    const key = keyMap[input];
    if (key === undefined)
        return false;

    e.preventDefault();

    if (e.repeat)
        return true;

    switch (key) {
        case 'octDown':
            if (isDown) {
                if (isShiftKeyDown) {
                    transpose = Math.max(transpose - 1, 0);
                } else {
                    transpose = Math.max(transpose - 12, transpose % 12);
                }
            }
            break;

        case 'octUp':
            if (isDown) {
                if (isShiftKeyDown) {
                    transpose = Math.min(transpose + 1, 127);
                } else {
                    transpose = Math.min(transpose + 12, 120 + transpose % 12);
                }
            }
            break;

        case 'velDown':
            if (isDown) {
                if (isShiftKeyDown) {
                    vel = Math.max(vel - 1, 7);
                } else {
                    vel = Math.max(vel - 8, 7);
                }
            }
            break;

        case 'velUp':
            if (isDown) {
                if (isShiftKeyDown) {
                    vel = Math.min(vel + 1, 127);
                } else {
                    vel = Math.min(vel + 8, 127);
                }
            }

        case 'shiftKey':
            if (isDown) {
                isShiftKeyDown = true;
            } else {
                isShiftKeyDown = false;
            }
            break;

        default:
            const note = key + transpose;
            if (note > 128)
                return false;

            if (isDown) {
                currentKey = key;
                connection.sendNoteOn(note, vel);

            } else if (key === currentKey) {
                connection.sendNoteOff();
            }
            break;
    }

    return true;
}

export function setup(connection_) {
    connection = connection_;

    Settings.onChange('virtualKeyboard', value => {
        enabled = value;
        connection.sendNoteOff();
    });
}

