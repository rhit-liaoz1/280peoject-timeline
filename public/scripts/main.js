
var rhit = rhit || {};

rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_KEY_UID = "UserID";
rhit.FB_KEY_USERNAME = "Username";
rhit.FB_KEY_IMAGEURL = "ImageURL";
rhit.FB_KEY_LOCATION = "Location";
rhit.FB_KEY_AGE = "Age";

rhit.loginPageModel = null;
rhit.timelineListModel = null;
rhit.profilePageModel = null;

rhit.TimelineListController = class {

	constructor(){

    document.querySelector("#signOutButton").addEventListener("click", () => {

      rhit.loginPageModel.signOut();
    });

    rhit.timelineListModel.beginListening(this.updateView.bind(this));
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

	beginListening(changeListener){

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
    
    document.querySelector("#finishEditingButton").addEventListener("click", () => {

      let username = document.querySelector("#profileUsername").value;
      let imageURL = document.querySelector("#profileImageURL").value.trim();
      let location = document.querySelector("#profileLocation").value;
      let age = document.querySelector("#profileAge").value.trim();

      rhit.profilePageModel.updateProfile(username, imageURL, age, location);
    });

    rhit.loginPageModel.beginListening(this.updateView.bind(this));
	}

	updateView(){

	}
}

rhit.ProfilePageModel = class {

	constructor(){

    this._documentSnapshot;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(rhit.loginPageModel.uid);
		this._unsubscribe = null;
	}

	beginListenting(changeListener){

    this._unsubscribe = this._ref.onSnapshot((doc) => {

      if (doc.exists){

        this._documentSnapshot = doc;
      }

      else {

        console.log("No Profile Document Found");
      }
    });
	}

	stopListening(){

	}

	delete(){

  }

	updateProfile(username, imageURL, age, location){

    this._ref.update({

      [rhit.FB_KEY_UID]: rhit.loginPageModel.uid,
      [rhit.FB_KEY_LOCATION]: location,
      [rhit.FB_KEY_AGE]: age,
      [rhit.FB_KEY_IMAGEURL]: imageURL,
      [rhit.FB_KEY_USERNAME]: username,
    })
    .then(() => {

      console.log("Profile document successfully updated");
      window.location.href = "/profile.html";
    })
    .catch((error) => {

      console.log("Error updating profile document: ", error);
    });
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

    document.querySelector("#guestButton").addEventListener("click", () => {

      rhit.loginPageModel.signInAsGuest();
    });
	}

	updateView(){

	}
}

rhit.LoginPageModel = class {

	constructor(){

    this._user;
    this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
	}

	beginListening(changeListener){

    firebase.auth().onAuthStateChanged((user) => {

      this._user = user;
      changeListener();
    });
  }

  createProfile(uid){

    firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(uid).set({

      [rhit.FB_KEY_UID]: uid,
      [rhit.FB_KEY_LOCATION]: "",
      [rhit.FB_KEY_AGE]: -1,
      [rhit.FB_KEY_IMAGEURL]: "",
      [rhit.FB_KEY_USERNAME]: "",
    })
    .then(() => {

      console.log("Profile document written successfully");
    })
    .catch((error) => {

      console.log("Error adding profile document: ", error);
    });
  }

  createUserWithEmailAndPassword(email, password){

    console.log(`Create account for email: ${email} password: ${password}`);
  
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userRecord) => {

      console.log("Creation: ", userRecord.user.uid);
      createProfile(userRecord.user.uid);
    })
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

  signInAsGuest(){

    console.log("Signed in as Guest");

    firebase.auth().signInAnonymously()
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(`Anonymous Auth Error ${errorCode} ${errorMessage}`);
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

	get isSignedIn(){

    return !!this._user;
  }
  
  get isGuest(){

    return this._user.isAnonymous;
  }

	get uid(){

    return this._user.uid;
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

  else if (document.querySelector("#mainTimelinePage")){

    rhit.timelineListModel = new rhit.TimelineListModel();
    new rhit.TimelineListController()
  }

  else if (document.querySelector("#editingProfilePage")){

    rhit.profilePageModel = new rhit.ProfilePageModel();
    new rhit.ProfilePageController();
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