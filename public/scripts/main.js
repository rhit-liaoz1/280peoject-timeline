
var rhit = rhit || {};

// Firebase Keys
rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_KEY_UID = "UserID";
rhit.FB_KEY_USERNAME = "Username";
rhit.FB_KEY_IMAGE_URL = "ImageURL";
rhit.FB_KEY_LOCATION = "Location";
rhit.FB_KEY_AGE = "Age";
rhit.FB_COLLECTION_TIMELINE_LIST = "TimelineList";
rhit.FB_KEY_TITLE = "Title";
rhit.FB_KEY_DESCRIPTION = "Description";
rhit.FB_KEY_PRIVATE_EDIT = "Private Edit";
rhit.FB_KEY_PRIVATE_VIEW = "Private View";
rhit.FB_KEY_AUTHOR = "Author";
rhit.FB_COLLECTION_EVENT_LIST = "EventList";
rhit.FB_KEY_START_DATE = "StartDate";
rhit.FB_KEY_END_DATE = "EndDate";

// Singletons
rhit.loginPageModel = null;
rhit.timelineListModel = null;
rhit.profilePageModel = null;
rhit.singleTimelineModel = null;
rhit.eventPageModel = null;


function htmlToElement(html){

  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

rhit.TimelineListController = class {

	constructor(){

    document.querySelector("#signOutButton").addEventListener("click", () => {

      rhit.loginPageModel.signOut();
    });

    document.querySelector("#submitAddTimeline").addEventListener("click", () => {

      const title = document.querySelector("#inputTitle").value;
      const description = document.querySelector("#inputDescription").value;
      const privateEdit = document.querySelector("#privateEditPermission").checked;
      const privateView = document.querySelector("#privateViewPermission").checked;

      rhit.timelineListModel.createTimeline(title, description, privateView, privateEdit, rhit.loginPageModel.uid);
    });

    $("#addNewTimeline").on("show.bs.modal", (event) => {

      document.querySelector("#inputTitle").value = "";
      document.querySelector("#inputDescription").value = "";  
      document.querySelector("#privateEditPermission").checked = true;
      document.querySelector("#privateViewPermission").checked = true;    
    });

    $("#addNewTimeline").on("shown.bs.modal", (event) => {

      document.querySelector("#inputTitle").focus();
    });

    rhit.timelineListModel.beginListening(this.updateView.bind(this));
	}

	updateView(){

    const newTimelineList = htmlToElement(`<ul id="timelineListContainer" class="timelinedisplay"></ul>`);

    for (let i = 0; i < rhit.timelineListModel.length; i++){

      const timeline = rhit.timelineListModel.getTimelineAtIndex(i);     
      const newSection = this._createTimelineSection(timeline, i);

      newTimelineList.appendChild(newSection);
    }

    const oldTimelineList = document.querySelector("#timelineListContainer");
    oldTimelineList.removeAttribute("id");
    oldTimelineList.parentElement.appendChild(newTimelineList);
    oldTimelineList.parentElement.removeChild(oldTimelineList);
  }
  
  _createTimelineSection(timeline, index){

    const button = htmlToElement(`<button type="button" class="btn bmd-btn-fab-sm bmd-btn-fab">
                                    <i class="material-icons">add</i>
                                  </button>`);

    button.addEventListener("click", () => {

      const item = document.querySelector(`#descriptionOfItem${index}`);
      item.hidden = ! item.hidden;
    });

    const title = htmlToElement(`<h5>${timeline.title}</h5>`);

    title.addEventListener("click", () => {

      window.location.href = `/timeline.html?timelineID=${timeline.id}`;
    });
                            
    const section = htmlToElement(`<li>
                                    <div class="desc">
                                      <p id="descriptionOfItem${index}" class="descriptionFont" hidden>${timeline.description}</p>
                                      <hr class="lineBreak">
                                    </div>
                                  </li>`);
    
    section.querySelector(".desc").prepend(title);
    section.prepend(button);

    return section;
  }
}

rhit.TimelineListModel = class {

	constructor(){

		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_TIMELINE_LIST);
		this._unsubscribe = null;
	}

	beginListening(changeListener){

    this._unsubscribe = this._ref.onSnapshot((query) => {

        this._documentSnapshots = query.docs;
        changeListener();
    });
	}

	stopListening(){

    this._unsubscribe();
	}

	createTimeline(title, description, viewPermission, editPermission, author){

    this._ref.add({

      [rhit.FB_KEY_TITLE]: title,
      [rhit.FB_KEY_DESCRIPTION]: description,
      [rhit.FB_KEY_PRIVATE_VIEW]: viewPermission,
      [rhit.FB_KEY_PRIVATE_EDIT]: editPermission,
      [rhit.FB_KEY_AUTHOR]: author,
    })
    .then((docRef) => {

      console.log("Timeline document Written with ID: ", docRef.id);
    })
    .catch((error) => {

      console.log("Error adding timeline document: ", error);
    });
	}

	get length(){

    return this._documentSnapshots.length;
	}

	getTimelineAtIndex(index){

    let ds = this._documentSnapshots[index];
    return new rhit.Timeline(ds.id, ds.get(rhit.FB_KEY_TITLE), ds.get(rhit.FB_KEY_DESCRIPTION));
	}
}

rhit.Timeline = class {

	constructor(id, title, description){

    this.id = id;
		this.title = title;
		this.description = description;
	}
}

rhit.SingleTimelineController = class {

	constructor(){

    document.querySelector("#signOutButton").addEventListener("click", () => {

      rhit.loginPageModel.signOut();
    });

    document.querySelector("#backButton").addEventListener("click", () => {

      window.location.href = `/maintimeline.html`;
    });

    document.querySelector("#submitAddEvent").addEventListener("click", () => {

      const startDate = document.querySelector("#inputStartDate").value;
      const endDate = document.querySelector("#inputEndDate").value;
      const title = document.querySelector("#inputTitle").value;
      const imageURL = document.querySelector("#inputImageURL").value;
      const description = document.querySelector("#inputDescription").value;

      rhit.singleTimelineModel.createEvent(startDate, endDate, title, imageURL, description);
    });

    $("#addNewEvent").on("show.bs.modal", (event) => {

      document.querySelector("#inputStartDate").value = "";
      document.querySelector("#inputEndDate").value = "";
      document.querySelector("#inputTitle").value = "";
      document.querySelector("#inputImageURL").value = "";
      document.querySelector("#inputDescription").value = "";   
    });

    $("#addNewEvent").on("shown.bs.modal", (event) => {

      document.querySelector("#inputStartDate").focus();
    });

    rhit.singleTimelineModel.beginListening(this.updateView.bind(this));
	}

	updateView(){

    rhit.singleTimelineModel.getMinDate()
    .then((minDate) => {

      const zoom = 10;

      const start = minDate - minDate % zoom;

      let groupIndex = start + zoom;
      let currentGroup = this._createEventGroup(groupIndex - zoom, groupIndex);

      const newEventList = htmlToElement(`<ul id="eventListContainer" class="timelinedisplay"></ul>`);
      newEventList.appendChild(currentGroup);

      for (let i = 0; i < rhit.singleTimelineModel.length; i++){
  
        const event = rhit.singleTimelineModel.getEventAtIndex(i);     
        const item = this._createEventItem(event);

        while (event.startDate > groupIndex){

          groupIndex += zoom;
          currentGroup = this._createEventGroup(groupIndex - zoom, groupIndex);
          newEventList.appendChild(currentGroup);
        }

        currentGroup.querySelector(`#containerForRange${groupIndex - zoom}-${groupIndex}`).appendChild(item);
      }
  
      const oldEventList = document.querySelector("#eventListContainer");
      oldEventList.removeAttribute("id");
      oldEventList.parentElement.appendChild(newEventList);
      oldEventList.parentElement.removeChild(oldEventList);
    });
  }

  _createEventGroup(startYear, endYear){

    const button = htmlToElement(`<button type="button" class="btn bmd-btn-fab-sm bmd-btn-fab">
                                    <i class="material-icons">add</i>
                                  </button>`);

    const group = htmlToElement(`<li class="blueBottom">
                                  <h5 class="inlineDisplay">${startYear}-${endYear}</h5>
                                  <div class="desc">
                                    <ul id="containerForRange${startYear}-${endYear}" hidden>
                                    </ul>
                                  </div>
                                </li>`);

    button.addEventListener("click", () => {

      const item = group.querySelector(`#containerForRange${startYear}-${endYear}`);
      item.hidden = ! item.hidden;
    });

    group.prepend(button);

    return group;
  }
  
  _createEventItem(event){

    const title = htmlToElement(`<li class="smallFont">${event.title}</li>`);

    title.addEventListener("click", () => {

      window.location.href = `/detail.html?timelineID=${rhit.singleTimelineModel.id}&eventID=${event.id}`;
    });

    return title;
  }
}

rhit.SingleTimelineModel = class {

	constructor(timelineID){

    this._documentSnapshot = null;
    this._timelineID = timelineID;
    this._timelineRef = firebase.firestore().collection(rhit.FB_COLLECTION_TIMELINE_LIST).doc(timelineID);
    this._timelineUnsubscribe = null;

    this._documentSnapshots = [];
		this._eventListRef = this._timelineRef.collection(rhit.FB_COLLECTION_EVENT_LIST);
    this._eventListUnsubscribe = null;
	}

	beginListening(changeListener){

    this._timelineUnsubcribe = this._timelineRef.onSnapshot((doc) => {

      if (doc.exists){

        this._documentSnapshot = doc;
        changeListener();
      }

      else {

        console.log("No timeline document Found.");
      }
    });

    this._eventListUnsubscribe = this._eventListRef.orderBy(rhit.FB_KEY_START_DATE).onSnapshot((query) => {

      this._documentSnapshots = query.docs;

      changeListener();
    });
	}

	stopListening(){

    this._timelineUnsubcribe();
    this._eventListUnsubscribe();
	}

	deleteTimeline(){

	}

	updateTimeline(title, description, viewPermission, editPermission){

	}

	createEvent(startDate, endDate, title, imageURL, description){

    this._eventListRef.add({

      [rhit.FB_KEY_START_DATE]: startDate,
      [rhit.FB_KEY_END_DATE]: endDate,
      [rhit.FB_KEY_TITLE]: title,
      [rhit.FB_KEY_IMAGE_URL]: imageURL,
      [rhit.FB_KEY_DESCRIPTION]: description,
    })
    .then((docRef) => {

      console.log("Event document Written with ID: ", docRef.id);
      window.location.href = `/detail.html?timelineID=${this.id}&eventID=${docRef.id}`;
    })
    .catch((error) => {

      console.log("Error adding event document: ", error);
    });
  }
  
  getMinDate(){

    return this._eventListRef.orderBy(rhit.FB_KEY_START_DATE).limit(1).get()
    .then((querySnapshot) => {

      return querySnapshot.docs[0].get(rhit.FB_KEY_START_DATE);
    });
  }

	getEventAtIndex(index){

    const ds = this._documentSnapshots[index];
    return new rhit.Event(ds.id, ds.get(rhit.FB_KEY_START_DATE), ds.get(rhit.FB_KEY_END_DATE), ds.get(rhit.FB_KEY_TITLE));
	}

	get length(){

    return this._documentSnapshots.length;
  }
  
  get id(){

    return this._timelineID;
  }
}

rhit.Event = class {

	constructor(id, startDate, endDate, title){

    this.id = id;
		this.startDate = startDate;
		this.endDate = endDate;
		this.title = title;
	}
}

rhit.EventPageController = class {

	constructor(){

    document.querySelector("#backButton").addEventListener("click", () => {

      window.location.href = `/timeline.html?timelineID=${rhit.eventPageModel.timelineID}`;
    });

    rhit.eventPageModel.beginListening(this.updateView.bind(this));
	}

	updateView(){

    document.querySelector("#eventDate").textContent = `${rhit.eventPageModel.startDate}-${rhit.eventPageModel.endDate}`;
    document.querySelector("#eventName").textContent = rhit.eventPageModel.title;
    document.querySelector("#eventImage").src = rhit.eventPageModel.imageURL;
    document.querySelector("#textDescription").textContent = rhit.eventPageModel.description;
  }
}

rhit.EventPageModel = class {

	constructor(timelineID, eventID){

    this._timelineID = timelineID;

		this._documentSnapshot = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_TIMELINE_LIST).doc(timelineID).collection(rhit.FB_COLLECTION_EVENT_LIST).doc(eventID);
		this._unsubscribe = null;
	}

	beginListening(changeListener){

    this._timelineUnsubcribe = this._ref.onSnapshot((doc) => {

      if (doc.exists){

        this._documentSnapshot = doc;
        changeListener();
      }

      else {

        console.log("No event document Found.");
      }
    });
	}

	stopListening(){

    this._unsubscribe();
	}

	deleteEvent(){

	}

	updateEvent(year, title, imageURL, description, favoriteCount, pageContributors){

	}

	toggleFavorite(){

  }
  
  get timelineID(){

    return this._timelineID;
  }

	get startDate(){

    return this._documentSnapshot.get(rhit.FB_KEY_START_DATE);
	}

	get endDate(){

    return this._documentSnapshot.get(rhit.FB_KEY_END_DATE);
	}

	get title(){

    return this._documentSnapshot.get(rhit.FB_KEY_TITLE);
	}

	get imageURL(){

    return this._documentSnapshot.get(rhit.FB_KEY_IMAGE_URL);
	}

	get description(){

    return this._documentSnapshot.get(rhit.FB_KEY_DESCRIPTION);
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

	constructor(userID){

    this._documentSnapshot;
    console.log(userID);
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

    console.log(username);

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

	// _createProfile(){

  //   if (this.isSignedIn && this.isNewUser){

  //     this._ref.doc(this.uid).set({

  //       [rhit.FB_KEY_UID]: this.uid,
  //       [rhit.FB_KEY_LOCATION]: "",
  //       [rhit.FB_KEY_AGE]: -1,
  //       [rhit.FB_KEY_IMAGEURL]: "",
  //       [rhit.FB_KEY_USERNAME]: "",
  //     })
  //     .then(() => {

  //       console.log("Profile document written successfully");
  //     })
  //     .catch((error) => {

  //       console.log("Error adding profile document: ", error);
  //     });
  //   }
  // }

  createUserWithEmailAndPassword(email, password){

    console.log(`Create account for email: ${email} password: ${password}`);
  
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {

      console.log("Account creation successful");
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

  get isNewUser(){

    return !this._user.displayName;
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

  else if (document.querySelector("#timelinePage")){

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const timelineID = urlParams.get("timelineID");

    rhit.singleTimelineModel = new rhit.SingleTimelineModel(timelineID);
    new rhit.SingleTimelineController()
  }

  else if (document.querySelector("#detailPage")){

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const eventID = urlParams.get("eventID");
    const timelineID = urlParams.get("timelineID");

    rhit.eventPageModel = new rhit.EventPageModel(timelineID, eventID);
    new rhit.EventPageController()
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