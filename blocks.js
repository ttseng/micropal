// placing blockly container
let xmlText = '<xml xmlns="https://developers.google.com/blockly/xml" id="workspaceBlocks" style="display: none"><block type="tm_load_model" id="N@S;1`6j$v57ca]kO?gN" x="62" y="38"><field name="model_label">model url</field><field name="URL">https://teachablemachine.withgoogle.com/models/m3rMjtrvw/</field></block></xml>';
var blocklyArea = document.getElementById('blockly-container');
var blocklyDiv = document.getElementById('blockly-div');
var workspace = Blockly.inject(blocklyDiv,
    {toolbox: document.getElementById('toolbox')});
Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xmlText), workspace);
workspace.addChangeListener(updateFunction);

var onresize = function(e) {
  // Compute the absolute coordinates and dimensions of blocklyArea.
  var element = blocklyArea;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  // Position blocklyDiv over blocklyArea.
  blocklyDiv.style.left = x + 'px';
  blocklyDiv.style.top = y + 'px';
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  Blockly.svgResize(workspace);
};
window.addEventListener('resize', onresize, false);
onresize();
Blockly.svgResize(workspace);

function updateFunction(event){
  console.log(event.type);
  if(event.type == Blockly.Events.CREATE){
    // highlight blocks on execution
    Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    Blockly.JavaScript.addReservedWords('highlightBlock');

    let code = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById('blockly-code').innerHTML = code;
    try{
      eval(code);
    }catch(e){
      alert(e);
    }
  }    
}

function highlightBlock(id) {
  workspace.highlightBlock(id);
}