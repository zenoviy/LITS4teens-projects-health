/*
Симулятор логін форми, Частково це вс працює як справжня логін форма, але за однією відмінністю
справжні форми відправляють дані на сервер де вони зберігаються і обробляються після чого сервер відсилає нам 
або дозвіл на логін і розблокований контент який потім відображається, а дані щоб браузер знав що юзер зареєстрований
берігаються в Кеші браузера і ніколи не зберігається ні пароль ні інші дані ( дані криптуються, зашифровуються використовуючи секретний пароль
який є тільки на сервері, тобто при бажанні взнати твій пароль це майже неможливо)

в цьому ж прикладі ми немаємо сервера, але маємо браузер і його локальну базу даних де ми можемо
дані зберігати в текстовому режимі JSON формат а все що нам потрібно це window.localstorage https://developer.mozilla.org/uk/docs/Web/API/Window/localStorage 
коли будете реальні форми робити то віикористовуйте тільки систему збирання даних з форм


.login-access-box  style="display: none;"    цей клас і цей сить потрібно дабавити в блок який ви хочете показати залогіненому користувачеві
 

*/
const loginLogoutLogic = {		/* це основний об'єкт в середині якого відбуваються всі дії*/
	imageDb:["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"],  /* це назви зображень аватарок в папці ./images/avatar/    можна додати більше аватарок але їхгні назви треба в цей масив занести*/
	controllers:{			/* селектори до html елементів */
		loginLogoutForm: document.querySelector("#login-logout-form"),
		registrationForm: document.querySelector("#registration-form"),
		registrationSwitcher: document.querySelectorAll(".registration-switcher"),
		loginBtn: document.querySelector("#login-btn"),
		registrationBtn: document.querySelector("#registration-btn"),
		exampleModalCenterTitle: document.querySelector("#exampleModalCenterTitle"),
		loginInformationArea: document.querySelector("#login-information"),

		nameIndicator: document.querySelector("#name"),
		youName: document.querySelector("#you-name"),
		imageSelect: document.querySelector("#image-select"),
		loginSmallAvatar: document.querySelector("#login-small-avatar"),

		logOutField: document.querySelector("#log-out-field"),
		logInRegField: document.querySelector("#log-in-reg-field"),

		logOutBtn:document.querySelector("#log-out"),
		uploadPicture: document.querySelector("#uploadPicture"),
		loginPicture: document.querySelector("#login-picture"),
	},
	initForm(){				/* вхідна точка скрипта */
		let localObject = this;
		/*  login event */
		this.controllers.loginLogoutForm.addEventListener("submit", function(event){  /* івент натиску кнопки логін */
			event.preventDefault();						/* забороняю перезавантаження форми */
			localObject.loginUser(this, false);			/* метод логіну */				
		});
		/*  registration event */
		this.controllers.registrationForm.addEventListener("submit", function(event){  /* івент реєстрації */
			event.preventDefault();
			localObject.collectData(this);
		});
		let loginButtons = [...this.controllers.registrationSwitcher];
		loginButtons.forEach((x, i) =>{
			x.addEventListener("click", function(event){		/* івент переключання нопок реєстрація/логін */
				event.preventDefault();
				if(i == 0){
					loginButtons[0].className = `btn registration-switcher active-login-btn`;	/* міняю кнопкам класи щоб підсвічувалась вибрана */
					loginButtons[1].className = `btn registration-switcher`;
					localObject.switchClasses(localObject.controllers.loginLogoutForm, "show-area");	/* поазувати потрібне поле при натисканні на кнопку */
					localObject.switchClasses(localObject.controllers.registrationForm, "hidden-area");
				}else{
					loginButtons[0].className = `btn registration-switcher `;
					loginButtons[1].className = `btn registration-switcher active-login-btn`;
					localObject.switchClasses(localObject.controllers.loginLogoutForm, "hidden-area");
					localObject.switchClasses(localObject.controllers.registrationForm, "show-area");
				}
				localObject.showMessage( localObject.controllers.loginInformationArea, "", false);	/* стирання записів текстів попередження */
			})
		})
		this.loadImages(this.controllers.uploadPicture);	/* завантажуємо ватарку якщо є */
		this.checkLogin();									/* перевірка при завантаженні чи був юзер залогінений якщо так то аватарка появляється і вся інфа */
	},
	switchClasses(object, styleClasses, status){		/* метод переключення класів  використовую для переключання реєстрація/логін */
		object.className = 	styleClasses;
	},
	loginUser(loginData, state){				/* перевірка чи юзер був залогінений */
		let allStorage = window.localStorage;
		let res = JSON.parse(this.storageCall(allStorage, "allUsers"));		/* з localstorage дістаю ячейку теперішнього (залогіненого юзера, якщо він є) */
		let localData = {};								
		if(state){					/* перевірка чи заповнення з форми йде чи з localstorage */
			for(let items in loginData){		/* при тому чи іншому стані створюю новий локальний об'єкт з Емейлом і аролем */
				if(items.name){
					localData[items.name] = items.value;
				}
			}
		}else{
			for(let items of loginData){
				if(items.name){
					localData[items.name] = items.value;
				}
			}
		}
		let validatin = this.validateUser(res, localData, true);  /* перевірка чи юзер не існує  */
		if(!validatin.isValid){  /* тут якщо вертається false значить Юзер існує */
			this.showMessage(this.controllers.loginInformationArea, '', false);		/* очищуємо всі поля попереджень якщо вони були */
			let currentUser = {					/* об'єкт заповняємо */
				name: res[validatin.index].name,
				email: res[validatin.index].email,
				image: res[validatin.index].image,
			}
			for(let input of this.controllers.registrationForm){	/* очищаю полів вводу від інформації */
				if(input.name){
					input.value = "";
				}
			}
			allStorage.setItem("currentUser", JSON.stringify(currentUser));		/* якщо юзер правильно все заповний ві раніше не реєструвався то записуємо його в локальну базу даних */
		}else{
			this.showMessage(this.controllers.loginInformationArea, 'Invalid Email or Password', true); /* якщо пароль або мейл невірний то висвічує повідомлення */
		}
		this.checkLogin();				/* іперевірка логіну */
	},
	checkLogin(){				/* перевірка логіну при кожному завантаженні сайту */
		let allStorage = window.localStorage;
		let res = JSON.parse(this.storageCall(allStorage, "currentUser"));
		let allBtns = document.querySelectorAll(".login-btn");
		let hideArea = document.querySelectorAll(".login-access-box");
		let text = "";
		let style = "";
		if(res){  /* якщо є залогінений юзер то відображаємо його аватарку встановлюємо тексти міняємо текст кнопок login/logout */
			this.controllers.loginSmallAvatar.innerHTML = `<img width="50" height="50" src="${res.image}">`
			this.showMessage(this.controllers.nameIndicator, `${res.name}`, true);
			this.showMessage(this.controllers.youName, `${res.name}`, true);
			this.controllers.loginPicture.src = res.image; 
			this.showLogout(true);
			text = "logOut";
			style = "block";

		}else{
			this.showLogout(false)
			this.controllers.loginSmallAvatar.innerHTML ="";
			this.showMessage(this.controllers.youName, ``, false);
			this.showMessage(this.controllers.nameIndicator, ``, false);
			text = "logIn";
			style = "none";
		}
		[...allBtns].forEach(btn=>{			/* міняється текст в кнопках */
			btn.innerHTML = text;
		});
		[...hideArea].forEach(area =>{		/*  показуємо сховані блоки при успішному логіні або ховаємо */
			area.style = `display:${style};`;
		})
	},
	showLogout(state){		/* івент коли ти залогінений тобі показує кнопку logout або ховає registration/login */
		let localObject = this;
		if(state){
			this.controllers.logOutField.className = "show-area";
			this.controllers.logInRegField.className = "hidden-area";
			this.controllers.logOutBtn.addEventListener("click", function(event){
				localObject.logOut()	
			})
		}else{
			this.controllers.logOutField.className = "hidden-area";
			this.controllers.logInRegField.className = "show-area";
		}
	},
	logOut(){				/* метод який видаляє з бази даних ячейку з теперішнім юзеро */
		localStorage.removeItem("currentUser");
		this.checkLogin();
	},
	loadImages(selector){  /* підтягуємо аватарки для реєстрації */
		let localObject = this;
		var curFiles;
		let domObject = "";
		this.imageDb.forEach(obj =>{
			domObject += `<li  class="single-imgage-list dropdown-item" name="${obj}"><img width="100" height="100" src="./images/avatar/${obj}.jpg">${obj}</li>`
		})
		this.controllers.imageSelect.innerHTML = domObject;
		let list = document.querySelectorAll(".single-imgage-list");
		list = [...list];
		list.forEach(singleList=>{
			singleList.addEventListener("click", function(event){
				let localObj = singleList
				selector.innerHTML = `<img src="./images/avatar/${localObj.attributes.name.value}.jpg">`;  /*шлях до аватарки в тезі img при реєстрації і вибиранні */
				localObject.imagePatch = `./images/avatar/${localObj.attributes.name.value}.jpg`;
				localObject.showMessage( localObject.controllers.loginInformationArea, ``, false);
			})
		})
	},
	collectData(object){				/* збирання даних при реєстрації з інпутів */
		let logData = {};
		let innerData = {};
		let random = new Date().getTime();
		if(this.imagePatch){
			for(let items of object){
				if(items.name){
					innerData[items.name] = items.value;
				}
			}
			if(this.imagePatch){
				innerData.image = this.imagePatch
			}
			Object.defineProperty(logData, `${random}`, {  /* створений об'єкт доповняємо іншим об'єктом*/
				value:  innerData,
				writable: true,
				enumerable: true,
				configurable: true
			})
			this.storageSet(logData)
		}else{
			this.showMessage( this.controllers.loginInformationArea, `Upload picture first!!!`, true);
		}
	},
	storageCall(storage, db){
		return storage.getItem(db);
	},
	storageSet(items){   /* один з головних методів реєстрації нового юзера*/
		let allStorage = window.localStorage;
		let res = this.storageCall(allStorage, "allUsers");
		let allLocalDate = {};
		let dataBase;
		if(res){
			dataBase = JSON.parse(res);
			if(this.validateUser(dataBase, items, false).isValid){   /* якщо дані вірні були то зписуємо юзера*/
				allLocalDate = this.addUser(dataBase, items);   /* до попередніх юзерів додаємо щойноствореного */
				allStorage.setItem("allUsers", JSON.stringify(allLocalDate));	/* і переписуємо всіх юзерів в базу даних   */
				this.loginUser(items, true)
				this.switchLogin()
			}else{					/* якщо погано введені дані то виводимо повідомлення попередження що юзер вже існує */
				allStorage = window.localStorage;
				res = this.storageCall(allStorage);
				this.showMessage(this.controllers.loginInformationArea, 'user with this email already Exist!!!', true);
			}
		}else{			/* при першому завнтаженні ще немає об'єктів бази даних то створюємо її з  першим значенням (немає ще з чим порівнювати)*/
			allStorage.setItem("allUsers", JSON.stringify(items))
			allStorage = window.localStorage;
			res = this.storageCall(allStorage);
			this.switchLogin()
		}
	},
	switchLogin(){		/* переключення кнопок логін */
		let loginButtons = [...this.controllers.registrationSwitcher];
		loginButtons[0].className = `btn registration-switcher active-login-btn`;
		loginButtons[1].className = `btn registration-switcher`;
		this.switchClasses(this.controllers.loginLogoutForm, "show-area");
		this.switchClasses(this.controllers.registrationForm, "hidden-area");
	},
	addUser(dataItems, items){    /* підготовка даних юзера */
		let localObject = {};
		let index = 0;
		let localKey = Object.keys(dataItems);
		localKey.forEach(key => {
			localObject[key] = dataItems[key];
		})
		localObject[Object.keys(items)] = items[Object.keys(items)]
		return localObject
	},
	validateUser(base, curentDate, loginState){    /* перевірка  чи юзер існує в базі даних  */
		let currentObjects = (!loginState)? curentDate[Object.keys(curentDate)[0]] : curentDate;
		let validateState = true;
		let userIndex;
		for(let baseItems in base){
			if(!loginState){
				if(base[baseItems].name === currentObjects.name || base[baseItems].email === currentObjects.email
				){
					validateState = false;
					userIndex = baseItems;
				}
			}else{
				if(base[baseItems].password === currentObjects.password && base[baseItems].email === currentObjects.email
				){
					validateState = false;
					userIndex = baseItems;
				}
			}
		}
		return { isValid:validateState, index:userIndex }
	},
	showMessage( displayElement, text, errorState){    /*  метод виводу тексту попередження */
		let innerText = ``;
		if(errorState){
			innerText = text;
			displayElement.style="display: block;";
		}else{
			displayElement.style="display: none;";
			innerText = ``;
		}
		displayElement.innerHTML = innerText
	}
}
//window.localStorage.clear();  		/* метод щоб очистити базу даниїх від всіх записів я */
loginLogoutLogic.initForm()