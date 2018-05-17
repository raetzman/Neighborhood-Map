var model = {
    currentCat: null,
    cats: [
        {
            clickCount : 0,
            name : 'Sitting Cat',
            imgSrc : 'img/cat.jpg',
        },
        {
            clickCount : 0,
            name : 'Hiding Cat',
            imgSrc : 'img/cat2.jpg',
        },
        {
            clickCount : 0,
            name : 'Sleeping Cats',
            imgSrc : 'img/cat3.jpg',
        }
	],
	adminVisible : false
};

var octopus = {
	init: function() {
		model.currentCat = model.cats[0];
		CatListView.init();
		CatView.init();
		ButtonView.init();
		FormView.init();
	},
	getCurrentCat: function (){
		return model.currentCat;
	},
	setCurrentCat: function (obj){
		model.currentCat = obj;
	},
	getAllCats: function () {
		return model.cats;
	},
	incrementCats: function(){
		model.currentCat.clickCount++;
	},
	getClickCount: function(){
		return model.currentCat.clickCount;
	},
	changeCat: function(obj){
		model.currentCat.name = obj.name;
		model.currentCat.imgSrc = obj.imgSrc;
		model.currentCat.clickCount = obj.clickCount;
	},
	isAdmin: function(){
		return model.adminVisible;
	},
	setAdmin(){
		model.adminVisible = ! model.adminVisible;
	}
}


 var CatListView = {
	init: function(){
		
		// makes new object into this object 
		this.catListElem = document.getElementById('cat-list');		
		this.catListElem.innerHTML = "";
		var cat;
		
		 for(i = 0; i < octopus.getAllCats().length; i++){		
			cat = octopus.getAllCats()[i];
			
			var li = document.createElement('li');
			li.innerHTML = li.innerHTML + cat.name;
			this.catListElem.appendChild(li);
			
			
			li.addEventListener('click', (function(catCopy) {
                return function() {
					//document.getElementById('cat-img').src = catCopy.imgSrc;
					octopus.setCurrentCat(catCopy);
					CatView.render();
					FormView.render();
                };
            })(cat));
		}
	 }
 }

 var CatView = {
	init: function(){	
		document.getElementById('cat-img').addEventListener('click', function(){
			octopus.incrementCats();
			CatView.render();
			FormView.render();
		});
		this.render();
	},
	render: function(){		
		document.getElementById('cat-counter').innerHTML = octopus.getClickCount();
		document.getElementById('cat-img').src = octopus.getCurrentCat().imgSrc;		
	}
}

var ButtonView = {
	init: function() {
		this.adminbutton = document.getElementById('admin-button');
		this.adminbutton.addEventListener('click', function() {
			octopus.setAdmin();
			FormView.render();
		}
		);
		//this.render();
	},
	render: function(){
		// not needed!!!
		
	}
}

var FormView = {
	init: function() {
		this.adminform = document.getElementById('admin-form');
		octopus.inputName = document.getElementById('inputName');
		octopus.inputImgUrl = document.getElementById('inputImgUrl');
		octopus.inputclicks = document.getElementById('inputclicks');
		
		
		this.okButton = document.getElementById('ok-button');
		this.okButton.addEventListener('click', function() {
			octopus.getCurrentCat().name = octopus.inputName.value;
			octopus.getCurrentCat().imgSrc = octopus.inputImgUrl.value;
			octopus.getCurrentCat().clickCount = octopus.inputclicks.value;
			octopus.setAdmin();
			CatListView.init();
			CatView.render();
			FormView.render();
		});

		this.cancelButton = document.getElementById('cancel-button');
		this.cancelButton.addEventListener('click', function(){			
			octopus.setAdmin();
			FormView.render();
		});
		this.render();
	},
	render: function(){
		octopus.inputName.value = octopus.getCurrentCat().name;
		octopus.inputImgUrl.value = octopus.getCurrentCat().imgSrc;
		octopus.inputclicks.value = octopus.getCurrentCat().clickCount;
		if(octopus.isAdmin()){
			this.adminform.style.visibility = "visible";			
		}else{
			this.adminform.style.visibility = "hidden";
		}
	}
}

octopus.init();