
import {
    ViewerApp, AssetManagerPlugin, addBasePlugins, VariationConfiguratorPlugin, SimpleTextPlugin, Vector3, CameraView, CameraViewPlugin
} from "https://dist.pixotronics.com/webgi/runtime/bundle-0.9.20.mjs";

const applyVariationFromElement = (dotClass, element, type, config, onChange) => {
    element.addEventListener("click", () => {
        const category = config.variations[type].find((cat) => cat.name === element.getAttribute("data-category"));
        const index = parseInt(element.getAttribute("data-index"));
        if (dotClass === 'dot-gem') {
            config.applyVariation(config.variations.materials[2], index, "materials");
        }
        else {
            config.applyVariation(category, index, type);
            config.applyVariation(config.variations.materials[1], index, "materials");
        }

        const btnTextContainer = element.closest(".btn-text");
        if (btnTextContainer) {
            const dotMetal = btnTextContainer.querySelector(`.${dotClass}`);
            if (dotMetal) {

                const siblings = document.querySelectorAll(`.${dotClass}`);
                siblings.forEach((sibling) => {
                    sibling.classList.remove("dot-active");
                });
                dotMetal.classList.add("dot-active");
            }
        }

        setTimeout(() => {
            onChange(); // Call the onChange function here
        }, 300);
    });
};



const setupEventListeners = (config, controls, viewer, onChange) => {
    document.querySelectorAll(".material").forEach((el) => applyVariationFromElement('dot-metal', el, "materials", config, onChange));
    document.querySelectorAll(".diamond").forEach((el) => applyVariationFromElement('dot-gem', el, "materials", config));

    const pauseButton = document.getElementById('pause-rotation');
    const startButton = document.getElementById('resume-rotation');

    pauseButton.addEventListener('click', () => {
        pauseButton.style.display = "none";
        startButton.style.display = "block";
        controls.autoRotate = false;
    });

    startButton.addEventListener('click', () => {
        startButton.style.display = "none";
        pauseButton.style.display = "block";
        controls.autoRotate = true;
    });

    const zoomMinusButton = document.getElementById('zoom-border-minus');
    const zoomPlusButton = document.getElementById('zoom-border-plus');

    zoomMinusButton.addEventListener('click', () => controls.zoomOut(0.5));
    zoomPlusButton.addEventListener('click', () => controls.zoomIn(0.5));

    const snapShotButton = document.getElementById('snapshot');
    snapShotButton.addEventListener('click', () => {
        viewer.fitToView();
    });
};

async function setupViewer() {
    const viewer = new ViewerApp({
        canvas: document.getElementById("mcanvas"),
    });

    const loader = document.getElementById('loader'); //

    const manager = await viewer.addPlugin(AssetManagerPlugin);
    const config = await viewer.addPlugin(VariationConfiguratorPlugin);
    const text = await viewer.addPlugin(SimpleTextPlugin);
    // Add the CameraViewPlugin
    const camViewPlugin = await viewer.addPlugin(CameraViewPlugin);


    text.applyToAlphaMap = false;
    const controls = viewer.scene.activeCamera.controls;
    controls.autoRotate = true;

    await addBasePlugins(viewer);
    viewer.renderer.refreshPipeline();

    await config.importPath("https://rio-assets.s3.eu-west-2.amazonaws.com/config-2.json");

    let ring = await manager.addFromPath("https://rio-us.s3.us-east-1.amazonaws.com/rio-scene-together.glb");

    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
    }, 400); // Hide the loader after 2 seconds

    console.log(viewer);
    // manager.addFromPath("https://rio-assets.s3.eu-west-2.amazonaws.com/rio.vjson");
    const fontStyles = await (await fetch("https://fonts.googleapis.com/css2?family=Aboreto&family=Dancing+Script&family=Eagle+Lake&family=Inter&family=Italianno&family=Luxurious+Script&family=Montserrat&family=Nunito&family=Open+Sans&family=Roboto&family=Sacramento&family=Vidaloka&display=swap")).text()

    const state = {
        text: '',
        fontFamily: 'Dancing Script',
        style: fontStyles,
        fontSize: 50,
        textColor: '#36454F',
    }

    const fontFamily = ['Dancing Script', 'Inter', 'Aboreto', 'Montserrat', 'Nunito', 'Sacramento', 'Italianno',
        'Eagle Lake',
        'Ovo',
        'Vidaloka',
        'Open Sans',];


    const decalObject = viewer.scene.getObjectByName('TxtPlane');



    config.applyVariation(config.variations.materials[0], 0, "materials");
    config.applyVariation(config.variations.materials[1], 0, "materials");
    config.applyVariation(config.variations.materials[2], 0, "materials");
    var input = document.getElementById('engraving-text');
    var fontSelect = document.getElementById('font-select');
    var removeEngraving = document.getElementById('remove-engraving');

    input.addEventListener('focus', async () => {
        controls.autoRotate = false;

        // Create a new camera view
        let view = new CameraView();
        view.position = new Vector3(-2.3, 5.1, 4.1);
        view.up = new Vector3(0, 1, 0);  // Assuming the up direction is (0,1,0)

        // Add the view to the plugin
        camViewPlugin.camViews.push(view);

        // Animate the camera to the new view
        await camViewPlugin.animateToView(view, 500); // 2000 ms is the duration
        const pauseButton = document.getElementById('pause-rotation');
        const startButton = document.getElementById('resume-rotation');
        pauseButton.style.display = "none";
        startButton.style.display = "block";
    });

    input.addEventListener('input', async () => {
        state.text = input.value;
        state.fontFamily = fontFamily[fontSelect.selectedIndex];
        onChange({ last: true });
        removeEngraving.style.display = 'flex';
    });

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
        // Text is already added in the GLB, so we just need to update.
        text.updateText(decalObject, { ...state });
    }


    onChange();
    setupEventListeners(config, controls, viewer, onChange);
    controls.autoRotate = true;
}


setupViewer();
