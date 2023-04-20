import {
    trigger,
    style,
    transition,
    animate,
} from '@angular/animations';

export const ANIMATIONS = [
    trigger('fade', [
        transition('void => *', [
            style({
                opacity: 0
            }),
            animate('0.2s ease-in')
        ]),
        transition('* => void', [
            animate('0.2s ease-out', style({
                opacity: 0
            }))
        ])
    ])
];
