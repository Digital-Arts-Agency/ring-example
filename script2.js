import {
    ViewerApp, AssetManagerPlugin, addBasePlugins, VariationConfiguratorPlugin, SimpleTextPlugin, Vector3, CameraView, CameraViewPlugin
} from "https://dist.pixotronics.com/webgi/runtime/bundle-0.9.20.mjs";

const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

const applyVariationFromElement = (dotClass, element, type, config, categoryCache, onChange) => {
    element.addEventListener("click", () => {
        const category = categoryCache[element.getAttribute("data-category")];
        const index = parseInt(element.getAttribute("data-index"));

        if (dotClass === 'dot-gem') {
            config.applyVariation(config.variations.materials[2], index, "materials");
        } else {
            config.applyVariation(category, index, type);
            config.applyVariation(config.variations.materials[1], index, "materials");
        }

        const btnTextContainer = element.closest(".btn-text");
        if (btnTextContainer) {
            const dotMetal = btnTextContainer.querySelector(`.${dotClass}`);
            if (dotMetal) {
                document.querySelectorAll(`.${dotClass}`).forEach((sibling) => {
                    sibling.classList.remove("dot-active");
                });
                dotMetal.classList.add("dot-active");
            }
        }

        setTimeout(() => {
            onChange();
        }, 300);
    });
};

const setupEventListeners = (config, controls, viewer, onChange) => {
    const materialElements = document.querySelectorAll(".material");
    const diamondElements = document.querySelectorAll(".diamond");

    const categoryCache = {};
    config.variations.materials.forEach((cat) => {
        categoryCache[cat.name] = cat;
    });

    materialElements.forEach((el) => applyVariationFromElement('dot-metal', el, "materials", config, categoryCache, onChange));
    diamondElements.forEach((el) => applyVariationFromElement('dot-gem', el, "materials", config, categoryCache, onChange));

    document.getElementById('pause-rotation').addEventListener('click', () => {
        controls.autoRotate = false;
        toggleRotationButtons(false);
    });

    document.getElementById('resume-rotation').addEventListener('click', () => {
        controls.autoRotate = true;
        toggleRotationButtons(true);
    });

    document.getElementById('zoom-border-minus').addEventListener('click', () => controls.zoomOut(0.5));
    document.getElementById('zoom-border-plus').addEventListener('click', () => controls.zoomIn(0.5));

    document.getElementById('snapshot').addEventListener('click', () => {
        viewer.fitToView();
    });
};

const toggleRotationButtons = (isRotating) => {
    document.getElementById('pause-rotation').style.display = isRotating ? "block" : "none";
    document.getElementById('resume-rotation').style.display = isRotating ? "none" : "block";
};

async function setupViewer() {
    const viewer = new ViewerApp({
        canvas: document.getElementById("mcanvas"),
    });

    const loader = document.getElementById('loader');
    const manager = await viewer.addPlugin(AssetManagerPlugin);
    const config = await viewer.addPlugin(VariationConfiguratorPlugin);
    const text = await viewer.addPlugin(SimpleTextPlugin);
    const camViewPlugin = await viewer.addPlugin(CameraViewPlugin);

    await addBasePlugins(viewer);
    viewer.renderer.refreshPipeline();

    await config.importPath("https://rio-assets.s3.eu-west-2.amazonaws.com/config-2.json");

    const ring = await manager.addFromPath("https://rio-us.s3.us-east-1.amazonaws.com/rio-scene-together.glb", {
        dracoLoader: true,
        basisLoader: true,
    });

    requestAnimationFrame(() => {
        loader.style.display = 'none';
    });

    const controls = viewer.scene.activeCamera.controls;
    controls.autoRotate = true;

    const fontStyles = await (await fetch("https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap")).text();

    const state = {
        text: '',
        fontFamily: 'Dancing Script',
        style: fontStyles,
        fontSize: 50,
        textColor: '#36454F',
    };

    const fontFamily = ['Dancing Script', 'Inter', 'Aboreto', 'Montserrat', 'Nunito', 'Sacramento'];

    const decalObject = viewer.scene.getObjectByName('TxtPlane');
    config.applyVariation(config.variations.materials[0], 0, "materials");
    config.applyVariation(config.variations.materials[1], 0, "materials");
    config.applyVariation(config.variations.materials[2], 0, "materials");

    const input = document.getElementById('engraving-text');
    const fontSelect = document.getElementById('font-select');
    const removeEngraving = document.getElementById('remove-engraving');

    const predefinedView = new CameraView();
    predefinedView.position = new Vector3(-2.3, 5.1, 4.1);
    predefinedView.up = new Vector3(0, 1, 0);
    camViewPlugin.camViews.push(predefinedView);

    input.addEventListener('focus', async () => {
        controls.autoRotate = false;
        await camViewPlugin.animateToView(predefinedView, 500);
        toggleRotationButtons(false);
    });

    input.addEventListener('input', debounce(() => {
        state.text = input.value;
        state.fontFamily = fontFamily[fontSelect.selectedIndex];
        onChange({ last: true });
        removeEngraving.style.display = 'flex';
    }, 300));

    fontSelect.addEventListener('change', () => {
        state.fontFamily = fontFamily[fontSelect.selectedIndex];
        onChange({ last: true });
    });

    removeEngraving.addEventListener('click', () => {
        input.value = '';
        state.text = '';
        onChange({ last: true });
        removeEngraving.style.display = 'none';
        viewer.fitToView();
        controls.autoRotate = true;
    });

    function onChange(e) {
        if (e && !e.last) return;
        text.updateText(decalObject, { ...state });
    }

    onChange();
    setupEventListeners(config, controls, viewer, onChange);
}

setupViewer();
