addEventListener('keydown',e=>{if([' ','e','enter','j'].includes(e.key.toLowerCase())&&!e.repeat){e.preventDefault();act()}});
$('act').addEventListener('pointerdown',e=>{e.preventDefault();act()});
