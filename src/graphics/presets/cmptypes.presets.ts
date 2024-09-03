import ModelUiComponentType from "../models/ModelUiComponentType.js";
import {ROLES_PRESET} from "./roles.presets.js";

// Layout
const Layout = new ModelUiComponentType({
    _uid: 'layout',
    painted: false
});


const LinearLayout = new ModelUiComponentType({
    _uid: 'linear_layout',
    painted: false,
    specialize: Layout
});

const VerticalLayout = new ModelUiComponentType({
    _uid: 'vertical_layout',
    painted: false,
    specialize: Layout
    // direction: vertical
});


const GridLayout = new ModelUiComponentType({
    _uid: 'grid_layout',
    painted: false,
    specialize: Layout
    // direction: vertical
});


const PanelLayout = new ModelUiComponentType({
    _uid: 'vertical_layout',
    painted: false,
    specialize: Layout
    // direction: vertical
});


// inputs

// Buttons

const Button = new ModelUiComponentType({
    _uid: 'button',
    painted: true
});

const CheckboxBtn = new ModelUiComponentType({
    _uid: 'checkbox_button',
    painted: true,
    specialize: Button,
    statesCount: 2
});

const SwitchBtn = new ModelUiComponentType({
    _uid: 'switch_button',
    painted: true,
    specialize: Button,
    statesCount: 2
});

const ToggleBtn = new ModelUiComponentType({
    _uid: 'toggle_button',
    painted: true,
    specialize: Button,
    statesCount: 2
});


const RadioBtn = new ModelUiComponentType({
    _uid: 'radio_button',
    painted: true,
    specialize: Button,
    statesCount: 2
});


const FormResetButton = new ModelUiComponentType({
    _uid: 'radio_button',
    painted: true,
    specialize: Button,
    statesCount: 2,
    role: ROLES_PRESET["reset"]
});


export const CMP_TYPES:ModelUiComponentType[] = [

    Button,
    RadioBtn,
    ToggleBtn,
    CheckboxBtn,
    SwitchBtn
];

