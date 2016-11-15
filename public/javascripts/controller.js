var BTIAppController = { // ���������� ��� BTI-����������
    callbacks: {},
    papers: new BTIManagerPaper(), // �������� "�������"
    'type-manager': new BTIManagerTypeObjects() // �������� � ����� ��������� �����
};
function BTIPaper(paper,opt){// �������� ���������� "��������"
    this.opt = opt; // ����� ������� �����
    this.paper = paper; // ������ �� ��������� ��� ��������� �������� (� ������ ������ Raphael ���������)
    this.objects = {// �������� �������� ������ "��������"
        general: new BTIManagerObjects(),// �������� �������
        service:new BTIManagerObjects() // ���������
    }
};
function BTIManagerTypeObjects() { // �������� ����� ��������
  this.getMenuItems = function () {
    return this.menuItems;
  };

  this.menuItems = [];

  this.types = {};// ������ �������� ������������� ������ �����
    // ������� ���������� �����(���������:
    // 1. ����� ����������� ����� ����� �
    // 2. ���������� ��� ���������  js ������ � ��������� ���������� ��� �������� �����
    this.add = function(attrs, dir){
        var deferreds = [];
        for(var i in attrs){ // ������ ����� ������� �� �������� ����� ����� ���������
            if (this.types[i]) continue; //���� ��� � ��������� ������ ��� ���������
            this.types[i] = { // ���������� ������ ����
                opt: attrs[i],// ����� ������� �����
                // ����������� ���� ����� ���� �������� ��� ��������� ���������������� �����
                callbacks:null,// � �������� callbacks ���������� �������, ������� ���������� ������ �������,
                // �� �� �������� ��� ������ (������� ��� ������� �����������),
                // � ��� �� ���������� ������ ����� ���������� �������������� � ������� �������� ���������
                // � �������� � ����� ������ ������������,������ ���� ������� ��� ������� ������������ �������
                createFromDB:function(){
                    console.log('Creation function is not defined by type: ' + i);
                    return null;
                },
                create:function(){ // ������ �������� ���������� ������� ������� ����
                    console.log('Creation function is not defined by type: ' + i);
                    return null;
                }
            };// ���������� ��������� ����(-�)

          var result = $.ajax({
            async: false,
            dataType: "script",
            url: dir + i + '.js',
            success: (data) => {
              if (!attrs[i].categoryId) return;

              this.menuItems.push({
                key: i,
                icon: attrs[i].icon ? attrs[i].icon : 'images/undef-object.png',
                categoryId: attrs[i].categoryId
              });
            },
            error: (err) => {
              if (!attrs[i].categoryId) return;

              this.menuItems.push({
                key: i,
                icon: attrs[i].icon ? attrs[i].icon : 'images/undef-object.png',
                error: true,
                categoryId: attrs[i].categoryId
              });
            }
          });

          deferreds.push(result);
          //deferreds.push($.getScript(dir + i + '.js').fail(/*()=>{console.log('Type did not load by attr: ' + i)}*/));
        }
        if (!deferreds.length) return;
        // $.when() ���������� promise-������ (�����������) deferred-�������
        // promise ������� �������� ��� �� ������� �������, ��� � ��� ������,
        // �� ����������� ���������� ������� ���������� ��� ���������.
        // ���� ���� �� deferred-�������� �������� � ��������� ������ ����������,
        // �� ��������� deferred ������ ��� ��������� ����� �� ���.
        $.when.apply($,deferreds)
            .done(/*()=>{console.log('All types have yet done');}*/)
            .fail(/*()=>{console.log('Invalide scripts');}*/);
   };
    // ������� �������� ������� ���������� ����
    // ���������: ��� � ����������� ���������������� �����
    this.create = function(type,opt) {
        var obj = this.types[type];//console.log(obj['create']);
        return (obj ? obj['create'](opt) : null);
    };
    this.createFromDB = function(type,opt){
        var obj = this.types[type];
        return (obj ? obj.createFromDB(opt) : null);
    }
};
function BTIManagerPaper() {
    this.current = null; // ������� �������� �������
    this.papers = {}; // ������, �������� ������������� ������ "�������
    this.selected = function(index){ // ������� ��������� ������� "��������"
        if(!index) index = this.current;
        return this.papers[index];
    }
    this.paperOpt = function(key,index){ // ������� ��������� ����� ������� ��������
        var current = this.selected(index);// �������� ������� "��������"
        if(!current) return null;// "��������" � ��������� ������� ����� ������������� � ������������� �������
        // ����� ���������� ��� ��������� �����  ��� ���� ������ ����� ��������� "��������"
        return ((typeof key == 'string' && key)?  current['opt'][key] : current['opt']);
    }
    this.setPaperOpt  = function(key,value,index){ // ������� ��������� ����� ������� ��������
        var current = this.selected(index);// �������� ������� "��������"
        if(!current) return null;if(typeof key == 'string' && key) current['opt'][key] =  value;
    }
    this.currentContext = function(index){ // ��������� ��������� ��� ��������� ���������  "��������"
        var current = this.selected(index);// �������� ������� "��������"
        if(!current) return null;// "��������" � ��������� ������� ����� ������������� � ������������� �������
        return current['paper']; // ���������� ������� ��������
    }
    this.setCurrentContext = function(paper,index){
        var current = this.selected(index);// �������� ������� "��������"
        if(!current) return false;// "��������" � ��������� ������� ����� ������������� � ������������� �������
        current['paper'] = paper;
        return true;
    }
    /* ������ ������� ������������� ��� ������ � ��������� �������� ����� */
    this.near = function(opt,index){// �������� ��������� �������� ������������ ��������� "��������" �� ���������������� �������
        var current = this.selected(index);// �������� ������� "��������"
        if(current) return current['objects']['general'].near(opt);// �������� ������� �������� ��������� �������� � ���������� ��� ���������
        return null;
    }
    this.currentElement = function(type,index){// ��������� ������� ������������ ��������� "��������" �� ���� �������
        var current = this.selected(index);// �������� ������� "��������"
        if(current)  return current['objects']['general'].getCurrentByType(type); // �������� ������� �������� ��������� �������� � ���������� ��� ���������
    }
    this.setCurrentElement = function(type,object,index){
        var current = this.selected(index);// �������� ������� "��������"
        if(current) return current['objects']['general'].setCurrentByType(type,object);
    }
    this.removeElement = function(id,index){
        var current = this.selected(index); // �������� ������� "��������"
        if(current) return current['objects']['general'].removeById(id);// �������� ������� �������� ��������� �������� � ���������� ��� ���������
        return false;
    }
    this.equal = function(opt,type,index){ // ��������� ��������������(-��) �������(-��) ������������ ��������� "��������" �� ���� ������� � ������������� ������
        var current = this.selected(index); // �������� ������� "��������"
        if(current) return current['objects']['general'].equal(opt,type);// �������� ������� �������� ��������� �������� � ���������� ��� ���������
        return null;
    }
    this.getObjectsByType = function(type,index){
        var current = this.selected(index);
        if(!current) return null;
        current = current.objects['general']['objects'];
        var array = new Array();
        if(typeof type == 'string') for (var i in current)
            if(current[i].type == type) array.push(current[i]);
        return array;
    }
    this.getObjectsList = function(manager,index){
        if(manager!= null && typeof manager!= 'boolean') index = manager;
        var current = this.selected(index);
        if(!current) return null;
        current = current.objects[(manager ? 'service': 'general')]['objects'];
        return Object.assign({},current);
    }
    /*--------------------------------------------*/
    this.addPaper = function(paper,opt,index) { // ���������� ����� "��������" (index - �������������, paper - ��������, opt - �����
       if(typeof index!= 'string' ||  index == '') // � ������,���� �� ������ �������������, ���������������� ��� �������������
           index = new Date().toString(); // "�����" ������� : (Object.keys - ��������� ������� ������ ���� ����� ������� �������)
       this.papers[index] = new BTIPaper(paper,opt); // ������� "��������"
       this.current = index; // ������������� ������� ������
    }
    this.getElementById = function(key,manager,index){ // ��������� �������� �� ��� �����
    // key - ����,
    // manager - ���������� ����,�������  ��������� : "�������� �� ��� ������ ���������"?,
    // index - ������������� ��������
        var current = this.selected(index); // �������� ������� "��������"
        if(current) { // ���� ������������� "��������" ����������
            manager = ((manager)? 'service':'general'); // �������� � ����� ������ ����� �������� ����������
            return current['objects'][manager].getElementById(key); // �������� ������� �������� ��������� �������� � ���������� ��� ���������
        }
        return null;
    }
    this.createElementFromDB = function(id,type,opt,index){
        var current = this.selected(index); // �������� ������� "��������"
        if(!current) return null;
        var object = current['objects']['general'].createFromDB(id, type, opt);
        if(object) {
          //  if(type == 'double-door') console.log(index);
            object['paper'] = index;
        }
        return object;
    }
    this.createElement = function(type,opt,key,manager,index){
        // type - ��� ������������� �������
        // opt - ����� ������������� �������
        // key - ������������� ������������ �������,
        // manager - ���������� ����,�������  ��������� : "�������� �� ��� ������ ���������"?,
        // index - ������������� ��������
        if(typeof opt != 'object'){ // ���� ����������� ����� ��� ������������� �������
            index = manager; // �������� ��� ��������� to right
            manager = key;
            key = opt;
            opt = {};
        }
        var current = this.selected(index); // �������� ������� "��������"
        if(current) {// ���� ������������� "��������" ����������
            var old = this.current;
            if(index) this.current = index;
            manager = ((manager)? 'service':'general'); // �������� � ����� ������ ����� �������� ����������
            current = current['objects'][manager].add(type,opt,key); // �������� ������� �������� ��������� �������� � ���������� ��� ���������
            if(current) current['paper'] = this.current;
            this.current = old;
            return current;
        }
        return false;
    }
};

function BTIManagerObjects() {
    this.objects = {};
    this.currents = {}
    this.add = function (type,opt,key) {
       var element = BTIAppController['type-manager'].create(type,opt);
       if(element){
           if(typeof key == 'undefined') {
               var keys = Object.keys(this.objects);
               if(!keys['length']) key = 0;
               else {
                   key = keys['length'].toString();
                   if (keys.find((element)=>{return (key == element)}))
                       key = (Math.max.apply(null,keys.map((x)=> {
                           return Number(x);
                       })) + 1);
               }
           }
           element['id'] = key.toString();
           this['objects'][key] = element;
           if(BTIAppController['type-manager'].types[type].incumbent) this.setCurrentByType(type,element);
       }
       return element;
    };
    this.createFromDB = function(id,type,opt){
        var element = BTIAppController['type-manager'].createFromDB(type,opt);
        if(element){
            element['id'] = id;
            this.objects[id] = element;
            if(BTIAppController['type-manager'].types[type].incumbent) this.setCurrentByType(type,element);

        }
        return element;
    }
    this.removeById = function(id){
        var object = this.objects[id];
        if(!object) return false;
        if(object['remove']) object.remove();
        if(this.currents[object['type']]) delete this.currents[object['type']];
        delete this.objects[id];
        return true;
    }
    this.getElementById = function(key){
        return this['objects'][key];
    }
    this.getCurrentByType = function(type){
       return this.objects[this.currents[type]];
    }
    this.setCurrentByType = function(type,object) {
         this.currents[type] = (object ? object['id']: null);
    };
    this.equal = function(opt,type){
        var array = new Array();
        for(var i in this.objects) {
            if(type) if(type != this.objects[i].type) continue;
            if(this.objects[i].compare(opt)) array.push(this.objects[i])
        }
        return array;
    }
    this.near = function(opt){
        var element = this.objects[opt['key']];
        if(!this.objects[opt['key']]) return;
        var array = this['objects'],
            nearby = {
                left: null,
                top: null,
                right: null,
                bottom: null
            },temp;
        for (var i in array){
            if(opt['key'] == i) continue;
            if(opt['type']) if(opt['type'] != array[i].type) continue;
            else  if(element['type'] != array[i].type) continue;
            temp  = BTIBaseObject.nearByAxis(element,array[i],opt['min']);
            if(temp) nearby[temp] = ((nearby[temp]) ? BTIBaseObject.nearByType(array[i],nearby[temp],temp): array[i]);
        }
        return nearby;
    }
};