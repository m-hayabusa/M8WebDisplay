// Copyright 2021 James Deery
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Settings from './settings.js';

const keyMap = Object.freeze({
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

    Tab: -1 + 12,
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
    BracketLeft: 17 + 12,
    Minus: 18 + 12,
    BracketRight: 19 + 12,
    Equal: 20 + 12,
    Backslash: 21 + 12,
    Delete: 22 + 12,
    Backspace: 23 + 12,

    ArrowUp: 'velUp',
    ArrowDown: 'velDown',
    ArrowLeft: 'octDown',
    ArrowRight: 'octUp',

    ShiftRight: 'shiftKey'
});

let connection;
let enabled = true;
let transpose = 36;
let vel = 0x64;
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
                    vel = Math.max(vel - 1, 1);
                } else {
                    vel = Math.max((vel - vel % 8 + 4) - 8, 7);
                }
            }
            break;

        case 'velUp':
            if (isDown) {
                if (isShiftKeyDown) {
                    vel = Math.min(vel + 1, 0x7F);
                } else {
                    vel = Math.min((vel - vel % 8 + 4) + 8, 0x7C);
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

