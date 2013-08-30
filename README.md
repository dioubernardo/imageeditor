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

* imageEditor.load( **image link or instace of File class** );
* imageEditor.clear( **x** , **y** , **width** , **height** );
* imageEditor.clearSelection();
* imageEditor.undo();
* imageEditor.floodFill( **x** , **y** , **tolerance** );
* imageEditor.getData( **[auto crop] **);
* imageEditor.enableSelect();
* imageEditor.disableSelect();
* imageEditor.enableClickAndDelete();
* imageEditor.disableClickAndDelete();
