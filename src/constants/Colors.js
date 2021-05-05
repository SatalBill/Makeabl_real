export default {
    darkred: '#B2242A',
    white: '#ffffff',
    backgroundColor: '#FFF',
    iconColor: "white",
    mainIconColor: "black",
    menuLight: "rgba(0,0,0,0.7)",
    bigSeparator: "#F5F5F9",
    detailsColor: "#626262",
    menuUnselected: "#F3F3F3",
    lightGray: "#BBBBBB",
    inputText: "#8B8B8B",
    borderColor: '#ced4da',
    authButton: "#40DCFD",
    authButtonTr: "#40FFFF",
    menuBar: 'rgb(23,63,104)',
    deactive: '#6a7187',
    main: '#0162E8',
    green: '#2E8A01',
    greenBac: '#D6F3E9',
    redBac: '#faa',
    greenCha: '#1B654A',
    pwdStrong: '#6CB043',
    redCha: '#a00',
    mainBG: '#ecf0fa',
    bronze: '#b4771e',
    silver: '#c0c0c0',
    gold: '#f0cd7c',
    warning: 'rgb(234,110,123)'
}

export const shadeColor = (color, percent) => {

    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}