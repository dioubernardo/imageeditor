# Simple Javascript image editor

See demo in [http://bernardosilva.com.br/imageditor/](http://bernardosilva.com.br/imageditor/) 

HMTL

```html
<script src="js/jquery.min.js"></script>
<script src="js/jquery.Jcrop.min.js"></script>
<script src="js/image-editor.js"></script>
<link rel="stylesheet" href="css/jquery.Jcrop.min.css" type="text/css" />

<div class="imageEditor" style="width:578px;height:400px"></div>
```

Javascript
```javascript
imageEditor.init('.imageEditor', true);
```

## Documentação

* imageEditor.init( **selector for base object** , **[allow open with drap and drop]** ]);

* imageEditor.load( **image link or instance of File class** );
* imageEditor.clear( **x** , **y** , **width** , **height** );
* imageEditor.clearSelection();
* imageEditor.undo();
* imageEditor.floodFill( **x** , **y** , **tolerance**, **continuo**, **color**);
* imageEditor.getData( **[auto crop] **);
* imageEditor.enableSelect();
* imageEditor.disableSelect();
* imageEditor.enableClickAndDelete(**options**);
* imageEditor.disableClickAndDelete();

```javascript
color para floodFill é {r:0, r:0, b:0, a:0}
options para enableClickAndDelete é {selectorTolerance: '', selectorContinuo: ''}
```

## Opções

* imageEditor.limitUndo = (int) default: 10
* imageEditor.loadImagesOnCenter = (boolean) default: true
* imageEditor.msgFileError = (string) default: 'Formato de imagem não suportado'

## Bugs
* Não suporta carregamento por darg and drop no Safari
* Não funciona no IE7