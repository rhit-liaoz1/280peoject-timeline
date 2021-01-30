
var rhit = rhit || {};

rhit.loginPageModel = null;

rhit.TimelineListController = class {

	constructor(){

	}

	updateView(){

	}

	toggleDescription(){

	}
}

rhit.TimelineListModel = class {

	constructor(){

		this._documentSnapshots;
		this._ref;
		this._unsubscribe;
	}

	beginListenting(changeListener){

	}

	stopListening(){

	}

	createTimeline(title, description, viewPermission, editPermission){

	}

	get length(){

	}

	getTimelineAtIndex(index){

	}
}

rhit.Timeline = class {

	constructor(title, description){

		this.title = title;
		this.description = description;
	}
}

rhit.SingleTimelineController = class {

	constructor(){

	}

	updateView(){

	}

	filterByYear(yearRange){

	}

	setZoomLevel(level){

	}

	toggleEventTitles(){

	}
}

rhit.SingleTimelineModel = class {

	constructor(){

		this._documentSnapshots;
		this._ref;
		this._unsubscribe;
	}

	beginListenting(changeListener){

	}

	stopListening(){

	}

	deleteTimeline(){

	}

	updateTimeline(title, description, viewPermission, editPermission){

	}

	createEvent(year, title, imageURL, description){

	}

	getEventAtIndex(index){

	}

	get length(){

	}
}

rhit.Event = class {

	constructor(year, title){

		this.year = year;
		this.title = title;
	}
}

rhit.EventPageController = class {

	constructor(){

	}

	updateView(){

	}
}

rhit.EventPageModel = class {

	constructor(){

		this._documentSnapshot;
		this._ref;
		this._unsubscribe;
	}

	beginListenting(changeListener){

	}

	stopListening(){

	}

	deleteEvent(){

	}

	updateEvent(year, title, imageURL, description, favoriteCount, pageContributors){

	}

	toggleFavorite(){

	}

	get year(){

	}

	get title(){

	}

	get imageURL(){

	}

	get description(){

	}

	get favoriteCount(){

	}

	get pageContributors(){

	}
}

rhit.ProfilePageController = class {

	constructor(){

		this.pageState;
	}

	updateView(){

	}
}

rhit.LoginPageModel = class {

	constructor(){

		this._documentSnapshot;
		this._ref;
		this._unsubscribe;
	}

	beginListenting(changeListener){

	}

	stopListening(){

	}

	delete(){

	}

	updateProfile(username, name, imageURL, age, location, favoriteEvents, createdEvents){

	}

	get username(){

	}

	get imageURL(){

	}

	get age(){

	}

	get location(){

	}

	get favoriteEvents(){

	}

	get createdEvents(){

	}
}


rhit.LoginPageController = class {

	constructor(){

    document.querySelector("#logInButton").addEventListener("click", () => {

      const inputEmail = document.querySelector("#inputEmail");
      const inputPassword = document.querySelector("#inputPassword");

      rhit.loginPageModel.signInWithEmailAndPassword(inputEmail.value, inputPassword.value);
    });

    document.querySelector("#createAccountButton").addEventListener("click", () => {

      const inputEmail = document.querySelector("#inputEmail");
      const inputPassword = document.querySelector("#inputPassword");

      rhit.loginPageModel.createUserWithEmailAndPassword(inputEmail.value, inputPassword.value);
    });
	}

	updateView(){

	}
}

rhit.LoginPageModel = class {

	constructor(){

		this._user;
	}

	createProfile(username, name, imageURL, age, location){

	}

	beginListening(changeListener){

    firebase.auth().onAuthStateChanged((user) => {

      this._user = user;
      changeListener();
    });
	}

	stopListening(){

  }

  createUserWithEmailAndPassword(email, password){

    console.log(`Create account for email: ${email} password: ${password}`);
  
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(`Create Account Error ${errorCode} ${errorMessage}`);
    });
  }
  
  signInWithEmailAndPassword(email, password){

    console.log(`Log in for email: ${email} password: ${password}`);
  
    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(`Existing Account Log In Error ${errorCode} ${errorMessage}`);
    });
  }

	signOut(){

    firebase.auth().signOut()
    .then(() => {
      
      console.log(`You are now signed out`);
    })
    .catch((error) => {
      
      console.log(`Signed out error`);
    });
	}

	isSignedIn(){

    return !!this._user;
	}

	get uid(){

	}
}

rhit.checkForRedirects = function(){

  if (document.querySelector("#loginPage") && rhit.loginPageModel.isSignedIn){
  
    window.location.href = "/maintimeline.html";
  }

  if (!document.querySelector("#loginPage") && !rhit.loginPageModel.isSignedIn){
  
    window.location.href = "/";
  }
}

rhit.initializePage = function(){

  if (document.querySelector("#loginPage")){

    new rhit.LoginPageController();
  }
}

rhit.main = function(){

  rhit.loginPageModel = new rhit.LoginPageModel();
  rhit.loginPageModel.beginListening(() => {
    
    rhit.checkForRedirects();
    rhit.initializePage();
  });
}

rhit.main();