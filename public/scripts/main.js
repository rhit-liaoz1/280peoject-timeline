
var rhit = rhit || {};

// Firebase Keys
rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_KEY_UID = "UserID";
rhit.FB_KEY_USERNAME = "Username";
rhit.FB_KEY_IMAGE_URL = "ImageURL";
rhit.FB_KEY_LOCATION = "Location";
rhit.FB_KEY_AGE = "Age";
rhit.FB_KEY_MEMBER_SINCE = "Member Since";
rhit.FB_COLLECTION_TIMELINE_LIST = "TimelineList";
rhit.FB_KEY_TITLE = "Title";
rhit.FB_KEY_DESCRIPTION = "Description";
rhit.FB_KEY_PRIVATE_EDIT = "Private Edit";
rhit.FB_KEY_PRIVATE_VIEW = "Private View";
rhit.FB_KEY_AUTHOR = "Author";
rhit.FB_COLLECTION_EVENT_LIST = "EventList";
rhit.FB_KEY_START_DATE = "StartDate";
rhit.FB_KEY_END_DATE = "EndDate";
rhit.FB_KEY_LANGUAGE = "fb";

// Singletons
rhit.loginPageModel = null;
rhit.timelineListModel = null;
rhit.profilePageModel = null;
rhit.singleTimelineModel = null;
rhit.eventPageModel = null;
rhit.settingsPageModel = null;

// https://stackoverflow.com/questions/12243818/adding-google-translate-to-a-web-site/12243949
function googleTranslateElementInit() {

  new google.translate.TranslateElement({pageLanguage: "en"}, "google_translate_element");
}

function htmlToElement(html){

  var template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Timeline List ------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.TimelineListController = class {

	constructor(){

    document.querySelector("#profilePicture").addEventListener("click", () => {

      if (! rhit.loginPageModel.isGuest) window.location.href = `/profile.html`;
    });

    document.querySelector("#signOutButton").addEventListener("click", () => {

      rhit.loginPageModel.signOut();
    });

    document.querySelector("#submitAddTimeline").addEventListener("click", () => {

      const title = document.querySelector("#inputTimelineTitle").value;
      const description = document.querySelector("#inputTimelineDescription").value;
      const privateEdit = document.querySelector("#privateEditPermission").checked;
      const privateView = document.querySelector("#privateViewPermission").checked;

      rhit.timelineListModel.createTimeline(title, description, privateView, privateEdit, rhit.loginPageModel.uid);
    });

    $("#addNewTimeline").on("show.bs.modal", (event) => {

      document.querySelector("#inputTimelineTitle").value = "";
      document.querySelector("#inputTimelineDescription").value = "";  
      document.querySelector("#privateEditPermission").checked = true;
      document.querySelector("#privateViewPermission").checked = true;    
    });

    rhit.timelineListModel.beginListening(this.updateView.bind(this));
	}

	updateView(){

    if (! rhit.loginPageModel.isGuest) document.querySelector("#addNewTimelineButton").hidden = false;

    const newTimelineList = htmlToElement(`<div id="timelineListContainer"></div>`);

    for (let i = 0; i < rhit.timelineListModel.length; i++){

      const timeline = rhit.timelineListModel.getTimelineAtIndex(i);
      
      if (! timeline.privateView || rhit.loginPageModel.uid == timeline.author){
      
        const newSection = this._createTimelineSection(timeline, i);
        newTimelineList.appendChild(newSection);
      }
    }

    const oldTimelineList = document.querySelector("#timelineListContainer");
    oldTimelineList.removeAttribute("id");
    oldTimelineList.parentElement.appendChild(newTimelineList);
    oldTimelineList.parentElement.removeChild(oldTimelineList);
  }
  
  _createTimelineSection(timeline, index){

    const button = htmlToElement(`<button type="button" class="btn bmd-btn-fab-sm bmd-btn-fab timelineItemButton">
                                    <i class="material-icons">keyboard_arrow_down</i>
                                  </button>
                                  `);

    button.addEventListener("click", () => {

      const item = document.querySelector(`#descriptionOfItem${index}`).parentElement;
      item.hidden = ! item.hidden;
    });

    const title = htmlToElement(`<h5 class="mainTimelineItemTitle">${timeline.title}</h5>`);

    title.addEventListener("click", () => {

      window.location.href = `/timeline.html?timelineID=${timeline.id}`;
    });
                            
    const section = htmlToElement(`<div class="mainTimelineItem">
                                    <div class="timelineDescriptionContainer" hidden>
                                      <p id="descriptionOfItem${index}">${timeline.description}</p>
                                    </div>
                                  </div>`);
    
    section.prepend(title);
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

	createTimeline(title, description, privateView, privateEdit, author){

    this._ref.add({

      [rhit.FB_KEY_TITLE]: title,
      [rhit.FB_KEY_DESCRIPTION]: description,
      [rhit.FB_KEY_PRIVATE_VIEW]: privateView,
      [rhit.FB_KEY_PRIVATE_EDIT]: privateEdit,
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
    return new rhit.Timeline(ds.id, 
                             ds.get(rhit.FB_KEY_TITLE), 
                             ds.get(rhit.FB_KEY_DESCRIPTION),
                             ds.get(rhit.FB_KEY_AUTHOR), 
                             ds.get(rhit.FB_KEY_PRIVATE_VIEW));
  }
}

rhit.Timeline = class {

	constructor(id, title, description, author, privateView){

    this.id = id;
		this.title = title;
		this.description = description;
    this.author = author;
    this.privateView = privateView;
	}
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Single Timeline ----------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.SingleTimelineController = class {

	constructor(){

    document.querySelector("#zoomSlider").addEventListener("mouseup", () => {

      this.updateView();
    });

    document.querySelector("#profilePicture").addEventListener("click", () => {

      if (! rhit.loginPageModel.isGuest) window.location.href = `/profile.html`;
    });

    document.querySelector("#signOutButton").addEventListener("click", () => {

      rhit.loginPageModel.signOut();
    });

    document.querySelector("#backButton").addEventListener("click", () => {

      window.location.href = `/maintimeline.html`;
    });

    document.querySelector("#deleteTimelineButton").addEventListener("click", () => {

      rhit.singleTimelineModel.deleteTimeline()
      .then(() => {

        console.log("Timeline successfully deleted");
        window.location.href = "/maintimeline.html";
      })
      .catch((error) => {

        console.log("Error deleting timeline");
      });
    });

    document.querySelector("#submitAddEvent").addEventListener("click", () => {

      const startDate = document.querySelector("#inputStartDate").value;
      const endDate = document.querySelector("#inputEndDate").value;
      const title = document.querySelector("#inputEventTitle").value;
      const imageURL = document.querySelector("#inputImageURL").value;
      const description = document.querySelector("#inputEventDescription").value;

      rhit.singleTimelineModel.createEvent(startDate, endDate, title, imageURL, description);
    });

    document.querySelector("#submitUpdateTimeline").addEventListener("click", () => {

      const title = document.querySelector("#inputTimelineTitle").value;
      const description = document.querySelector("#inputTimelineDescription").value;
      const privateEdit = document.querySelector("#privateEditPermission").checked;
      const privateView = document.querySelector("#privateViewPermission").checked;

      rhit.singleTimelineModel.updateTimeline(title, description, privateView, privateEdit);
    });
    
    $("#addNewEvent").on("show.bs.modal", (event) => {

      document.querySelector("#inputStartDate").value = "";
      document.querySelector("#inputEndDate").value = "";
      document.querySelector("#inputEventTitle").value = "";
      document.querySelector("#inputImageURL").value = "";
      document.querySelector("#inputTimelineDescription").value = "";   
    });

    $("#addNewEvent").on("shown.bs.modal", (event) => {

      document.querySelector("#inputStartDate").focus();
    });    

    $("#editTimeline").on("shown.bs.modal", (event) => {

      document.querySelector("#inputTimelineTitle").value = rhit.singleTimelineModel.title;
      document.querySelector("#inputTimelineDescription").value = rhit.singleTimelineModel.description;

      let privateEdit = rhit.singleTimelineModel.privateEdit;
      document.querySelector("#privateEditPermission").value = privateEdit;
      document.querySelector("#privateEditPermission").checked = privateEdit;
      document.querySelector("#publicEditPermission").checked = ! privateEdit;

      let privateView = rhit.singleTimelineModel.privateView;
      document.querySelector("#privateViewPermission").value = privateView;
      document.querySelector("#privateViewPermission").checked = privateView;
      document.querySelector("#publicViewPermission").checked = ! privateView;
    });
    
    $("#editTimeline").on("shown.bs.modal", (event) => {

      document.querySelector("#inputTimelineTitle").focus();
    });

    rhit.singleTimelineModel.beginListening(this.updateView.bind(this));
	}

	updateView(){

    if (rhit.singleTimelineModel.author == rhit.loginPageModel.uid){

      document.querySelector("#deleteTimelineButton").hidden = false;
      document.querySelector("#editTimelineButton").hidden = false;
      document.querySelector("#addNewEventButton").hidden = false;
    }

    if (! rhit.singleTimelineModel.privateEdit && ! rhit.loginPageModel.isGuest){

      document.querySelector("#addNewEventButton").hidden = false;
    }

    document.querySelector("#currentTimeline").textContent = rhit.singleTimelineModel.title;

    rhit.singleTimelineModel.getMinDate()
    .then((minDate) => {

      if (! minDate) return;

      const zoom = this._getZoomLevel();

      const start = minDate - minDate % zoom;

      let groupIndex = start + zoom;
      let currentGroup = this._createEventGroup(groupIndex - zoom, groupIndex);

      const newEventList = htmlToElement(`<div id="eventListContainer"></div>`);
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

    const button = htmlToElement(`<button type="button" class="btn bmd-btn-fab-sm bmd-btn-fab timelineItemButton">
                                    <i class="material-icons">keyboard_arrow_down</i>
                                  </button>
                                  <br>`);

    const group = htmlToElement(`<div class="timelineItem">
                                  <h5 class="timelineItemTitle">${startYear}-${endYear}</h5>
                                  <div class="bulletContainer" hidden>
                                    <ul id="containerForRange${startYear}-${endYear}">
                                    </ul>
                                  </div>
                                </div>`);

    button.addEventListener("click", () => {

      const item = group.querySelector(`#containerForRange${startYear}-${endYear}`).parentElement;
      item.hidden = ! item.hidden;
    });

    group.prepend(button);

    return group;
  }
  
  _createEventItem(event){

    const title = htmlToElement(`<li class="timelineEventItemTitle">${event.title}</li>`);

    title.addEventListener("click", () => {

      window.location.href = `/detail.html?timelineID=${rhit.singleTimelineModel.id}&eventID=${event.id}&privateEdit=${rhit.singleTimelineModel.privateEdit}`;
    });

    return title;
  }

  _getZoomLevel(){

    return 5 * Math.floor(20 / Math.pow(2, 5 - document.querySelector("#zoomSlider").value));
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

    this._timelineUnsubscribe = this._timelineRef.onSnapshot((doc) => {

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

    this._timelineUnsubscribe();
    this._eventListUnsubscribe();
	}

	deleteTimeline(){

    return this._timelineRef.delete();
	}

	updateTimeline(title, description, privateView, privateEdit){

    this._timelineRef.update({

      [rhit.FB_KEY_TITLE]: title,
      [rhit.FB_KEY_DESCRIPTION]: description,
      [rhit.FB_KEY_PRIVATE_VIEW]: privateView,
      [rhit.FB_KEY_PRIVATE_EDIT]: privateEdit,
    })
    .then((docRef) => {

      console.log("Timeline successfully updated");
    })
    .catch((error) => {

      console.log("Error updating timeline document: ", error);
    });
	}

	createEvent(startDate, endDate, title, imageURL, description){

    this._eventListRef.add({

      [rhit.FB_KEY_AUTHOR]: rhit.loginPageModel.uid,
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
  
  // TODO: check if return value is null when calling
  getMinDate(){

    return this._eventListRef.orderBy(rhit.FB_KEY_START_DATE).limit(1).get()
    .then((querySnapshot) => {

      if (querySnapshot.size == 0) return null;
      return querySnapshot.docs[0].get(rhit.FB_KEY_START_DATE);
    });
  }

	getEventAtIndex(index){

    const ds = this._documentSnapshots[index];
    return new rhit.Event(ds.id, ds.get(rhit.FB_KEY_START_DATE), ds.get(rhit.FB_KEY_END_DATE), ds.get(rhit.FB_KEY_TITLE));
  }
  
  get title(){

    return this._documentSnapshot.get(rhit.FB_KEY_TITLE);
  }

  get description(){

    return this._documentSnapshot.get(rhit.FB_KEY_DESCRIPTION);
  }

  get privateEdit(){

    return this._documentSnapshot.get(rhit.FB_KEY_PRIVATE_EDIT);
  }

  get privateView(){

    return this._documentSnapshot.get(rhit.FB_KEY_PRIVATE_VIEW);
  }

	get length(){

    return this._documentSnapshots.length;
  }
  
  get id(){

    return this._timelineID;
  }

  get author(){

    return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
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

// --------------------------------------------------------------------------------------------------------------------------------------
// Event --------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.EventPageController = class {

	constructor(){

    document.querySelector("#profilePicture").addEventListener("click", () => {

      if (! rhit.loginPageModel.isGuest) window.location.href = `/profile.html`;
    });

    document.querySelector("#signOutButton").addEventListener("click", () => {

      rhit.loginPageModel.signOut();
    });

    document.querySelector("#backButton").addEventListener("click", () => {

      window.location.href = `/timeline.html?timelineID=${rhit.eventPageModel.timelineID}`;
    });

    document.querySelector("#deleteEventButton").addEventListener("click", () => {

      rhit.eventPageModel.deleteEvent()
      .then(() => {

        console.log("Event deleted successfully");
        window.location.href = `timeline.html?timelineID=${rhit.eventPageModel.timelineID}`;
      })
      .catch((error) => {

        console.log("Error deleting event");
      });
    });
    
    document.querySelector("#submitUpdateEvent").addEventListener("click", () => {

      const startDate = document.querySelector("#inputStartDate").value;
      const endDate = document.querySelector("#inputEndDate").value;
      const title = document.querySelector("#inputEventTitle").value;
      const imageURL = document.querySelector("#inputImageURL").value;
      const description = document.querySelector("#inputEventDescription").value;

      rhit.eventPageModel.updateEvent(startDate, endDate, title, imageURL, description);
    });

    $("#updateEvent").on("shown.bs.modal", (event) => {

      document.querySelector("#inputStartDate").value = rhit.eventPageModel.startDate;
      document.querySelector("#inputEndDate").value = rhit.eventPageModel.endDate;
      document.querySelector("#inputEventTitle").value = rhit.eventPageModel.title;
      document.querySelector("#inputImageURL").value = rhit.eventPageModel.imageURL;
      document.querySelector("#inputEventDescription").value = rhit.eventPageModel.description;
    });
    
    $("#updateEvent").on("shown.bs.modal", (event) => {

      document.querySelector("#inputStartDate").focus();
    });

    rhit.eventPageModel.beginListening(this.updateView.bind(this));
	}

	updateView(){

    if (rhit.eventPageModel.author == rhit.loginPageModel.uid){

      document.querySelector("#deleteEventButton").hidden = false;
      document.querySelector("#updateEventButton").hidden = false;
    }

    if (! rhit.eventPageModel.privateEdit){

      document.querySelector("#updateEventButton").hidden = false;
    }

    document.querySelector("#eventDate").textContent = `${rhit.eventPageModel.startDate}-${rhit.eventPageModel.endDate}`;
    document.querySelector("#eventName").textContent = rhit.eventPageModel.title;
    document.querySelector("#eventImage").src = rhit.eventPageModel.imageURL;
    document.querySelector("#textDescription").textContent = rhit.eventPageModel.description;
  }
}

rhit.EventPageModel = class {

	constructor(timelineID, eventID, privateEdit){

    this._timelineID = timelineID;
    this._privateEdit = privateEdit == "true";

		this._documentSnapshot = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_TIMELINE_LIST).doc(timelineID).collection(rhit.FB_COLLECTION_EVENT_LIST).doc(eventID);
		this._unsubscribe = null;
	}

	beginListening(changeListener){

    this._unsubcribe = this._ref.onSnapshot((doc) => {

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

    return this._ref.delete();
	}

	updateEvent(startDate, endDate, title, imageURL, description){

    this._ref.update({

      [rhit.FB_KEY_AUTHOR]: rhit.loginPageModel.uid,
      [rhit.FB_KEY_START_DATE]: startDate,
      [rhit.FB_KEY_END_DATE]: endDate,
      [rhit.FB_KEY_TITLE]: title,
      [rhit.FB_KEY_IMAGE_URL]: imageURL,
      [rhit.FB_KEY_DESCRIPTION]: description,
    })
    .then((docRef) => {

      console.log("event updated successfully");
    })
    .catch((error) => {

      console.log("Error updating event document: ", error);
    });
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

	get author(){

    return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}

  get privateEdit(){

    return this._privateEdit;
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Profile ------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.ProfilePageController = class {

	constructor(){

    document.querySelector("#profileSignOutButton").addEventListener("click", () => {

      rhit.loginPageModel.signOut();
    });

    document.querySelector("#profileSettingsButton").addEventListener("click", () => {

      window.location.href = `/profileSettings.html?imageURL=${rhit.profilePageModel.imageURL}&username=${rhit.profilePageModel.username}`;
    });

    document.querySelector("#backButton").addEventListener("click", () => {

      window.location.href = `/maintimeline.html`;
    });
    
    document.querySelector("#submitUpdateProfile").addEventListener("click", () => {

      let username = document.querySelector("#modalUsername").value;
      let imageURL = document.querySelector("#modalImageURL").value.trim();
      let location = document.querySelector("#modalLocation").value;
      let age = document.querySelector("#modalAge").value.trim();

      rhit.profilePageModel.updateProfile(username, imageURL, age, location);
    });

    $("#updateProfile").on("shown.bs.modal", (event) => {

      document.querySelector("#modalUsername").value = rhit.profilePageModel.username;
      document.querySelector("#modalImageURL").value = rhit.profilePageModel.imageURL;
      document.querySelector("#modalLocation").value = rhit.profilePageModel.location;
      document.querySelector("#modalAge").value = rhit.profilePageModel.age;
    });
    
    $("#updateProfile").on("shown.bs.modal", (event) => {

      document.querySelector("#profileUsername").focus();
    });

    rhit.profilePageModel.beginListening(this.updateView.bind(this));
	}

	updateView(){

    document.querySelector("#location").textContent = `Location: ${rhit.profilePageModel.location}`;
    document.querySelector("#age").textContent = `Age: ${rhit.profilePageModel.age}`;
    document.querySelector("#member").textContent = `Member Since: ${rhit.profilePageModel.memberSince}`;
    document.querySelector("#profileUsername").textContent = `Username: ${rhit.profilePageModel.username}`;
    document.querySelector("#profileImage").src = rhit.profilePageModel.imageURL;
	}
} 

rhit.ProfilePageModel = class {

	constructor(){

    this._documentSnapshot = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(rhit.loginPageModel.uid);
		this._unsubscribe = null;
	}

	beginListening(changeListener){

    this._unsubscribe = this._ref.onSnapshot((doc) => {

      if (doc.exists){

        this._documentSnapshot = doc;
        changeListener();
      }

      else {

        console.log("No Profile Document Found");
      }
    });
	}

	stopListening(){

    this._unsubcribe();
	}

	updateProfile(username, imageURL, age, location){

    console.log(username);

    this._ref.update({

      [rhit.FB_KEY_LOCATION]: location,
      [rhit.FB_KEY_AGE]: age,
      [rhit.FB_KEY_IMAGE_URL]: imageURL,
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

    return this._documentSnapshot.get(rhit.FB_KEY_USERNAME);
	}

	get imageURL(){

    return this._documentSnapshot.get(rhit.FB_KEY_IMAGE_URL);
	}

	get age(){

    return this._documentSnapshot.get(rhit.FB_KEY_AGE);
	}

	get location(){

    return this._documentSnapshot.get(rhit.FB_KEY_LOCATION);
	}

	get memberSince(){

    let date = this._documentSnapshot.get(rhit.FB_KEY_MEMBER_SINCE).toDate();
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getYear() + 1900}`;
	}

	get favoriteEvents(){

	}

	get createdEvents(){

	}
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Profile Settings Page ----------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.SettingsPageController = class {

  constructor(){

    document.querySelector("#submitUpdatePassword").addEventListener("click", () => {
    
      const newPassword = document.querySelector("#newPassword").value.trim();
      const oldPassword = document.querySelector("#oldPassword").value.trim();
      rhit.settingsPageModel.setPassword(password);
    });

    $("#updatePassword").on("show.bs.modal", (event) => {

      document.querySelector("#newPassword").value = "";
      document.querySelector("#oldPassword").value = "";
    });

    $("#updatePassword").on("shown.bs.modal", (event) => {

      document.querySelector("#newPassword").focus();
    });

    document.querySelector("#profileSignOutButton").addEventListener("click", () => {

      rhit.loginPageModel.signOut();
    });

    document.querySelector("#deleteAccountButton").addEventListener("click", () => {

      rhit.settingsPageModel.delete();
    });

    document.querySelector("#backButton").addEventListener("click", () => {

      window.location.href = `/profile.html`;
    });

    rhit.settingsPageModel.beginListening(this.updateView.bind(this));
  }

  updateView(){

    document.querySelector("#profileImage").src = rhit.settingsPageModel.imageURL;
    document.querySelector("#profileUsername").textContent = `Username: ${rhit.settingsPageModel.username}`;
  }
}

rhit.SettingsPageModel = class {
  
  constructor(){

    this._documentSnapshot = null;
    this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(rhit.loginPageModel.uid);
    this._unsubscribe = null;
  }

  beginListening(changeListener){

    this._unsubscribe = this._ref.onSnapshot((doc) => {

      if (doc.exists){

        this._documentSnapshot = doc;
        changeListener();
      }

      else {

        console.log("No Profile Document Found");
      }
    });
  }

  stopListening(){

    this._unsubcribe();
  }

  delete(){

    this._ref.delete()
    .then(() => {

      return firebase.auth().currentUser.delete();
    })
    .then(() => {

      console.log("Successfully deleted user");
    })
    .catch((error) => {

      console.log("Error deleting user: ", error);
    });
  }

  setPassword(password){

    firebase.auth().currentUser.updatePassword(password)
    .then(() => {

      console.log("Password successfully updated.");
    })
    .catch((error) => {

      console.log("ERROR updating password: ", error);
    });
  }

	get imageURL(){

    return this._documentSnapshot.get(rhit.FB_KEY_IMAGE_URL);
	}

	get username(){

    return this._documentSnapshot.get(rhit.FB_KEY_USERNAME);
	}
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Login --------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.LoginPageController = class {

	constructor(){

    document.querySelector("#submitCreateProfile").addEventListener("click", () => {

      const username = document.querySelector("#modalUsername").value.trim();
      const imageURL = document.querySelector("#modalImageURL").value.trim();
      const location = document.querySelector("#modalLocation").value.trim();
      const age = document.querySelector("#modalAge").value.trim();
      const inputEmail = document.querySelector("#inputEmail");
      const inputPassword = document.querySelector("#inputPassword");

      rhit.loginPageModel.createUserWithEmailAndPassword(inputEmail.value, inputPassword.value, username, imageURL, location, age);
    });
    
    $("#createProfile").on("show.bs.modal", (event) => {

      document.querySelector("#modalUsername").value = "";
      document.querySelector("#modalImageURL").value = "";
      document.querySelector("#modalLocation").value = "";
      document.querySelector("#modalAge").value = "";
    });

    $("#createProfile").on("shown.bs.modal", (event) => {

      document.querySelector("#modalUsername").focus();
    });

    document.querySelector("#logInButton").addEventListener("click", () => {

      const inputEmail = document.querySelector("#inputEmail");
      const inputPassword = document.querySelector("#inputPassword");

      rhit.loginPageModel.signInWithEmailAndPassword(inputEmail.value, inputPassword.value);
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

    this._profileObject = null;
    this._user = null;
    this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
	}

	beginListening(changeListener){

    firebase.auth().onAuthStateChanged((user) => {

      this._user = user;

      if (this._profileObject){

        this._createProfile()
        .then(() => {

          changeListener();
        });
      }

      else changeListener();
    });
	}

	_createProfile(){
    
    if (this.uid && this._profileObject){

      return this._ref.doc(this.uid).set(this._profileObject);
    }

    else {

      console.log("ERROR creating profile");
    }

    return null;
  }

  createUserWithEmailAndPassword(email, password, username, imageURL, location, age){

    console.log(`Create account for email: ${email} password: ${password}`);
  
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {

      console.log("Account creation successful");
      this._profileObject = {

        [rhit.FB_KEY_LOCATION]: location,
        [rhit.FB_KEY_AGE]: age,
        [rhit.FB_KEY_IMAGE_URL]: imageURL || "https://i.stack.imgur.com/l60Hf.png",
        [rhit.FB_KEY_USERNAME]: username,
        [rhit.FB_KEY_MEMBER_SINCE]: firebase.firestore.Timestamp.now(),
      };
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

// --------------------------------------------------------------------------------------------------------------------------------------
// Page Switching Helpers ---------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.checkForRedirects = function(){

  if (document.querySelector("#loginPage") && rhit.loginPageModel.isSignedIn){
  
    window.location.href = "/maintimeline.html";
  }

  else if (!document.querySelector("#loginPage") && !rhit.loginPageModel.isSignedIn){
  
    window.location.href = "/";
  }

  else if (document.querySelector("#profilePage") && rhit.loginPageModel.isGuest){

    window.location.href = "/maintimeline.html";
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Page Initialization ------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.initializePage = function(){

  if (document.querySelector("#loginPage")){

    new rhit.LoginPageController();
  }

  else if (document.querySelector("#mainTimelinePage")){

    rhit.timelineListModel = new rhit.TimelineListModel();
    new rhit.TimelineListController();
  }

  else if (document.querySelector("#timelinePage")){

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const timelineID = urlParams.get("timelineID");

    rhit.singleTimelineModel = new rhit.SingleTimelineModel(timelineID);
    new rhit.SingleTimelineController();
  }

  else if (document.querySelector("#detailPage")){

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const eventID = urlParams.get("eventID");
    const timelineID = urlParams.get("timelineID");
    const privateEdit = urlParams.get("privateEdit");

    rhit.eventPageModel = new rhit.EventPageModel(timelineID, eventID, privateEdit);
    new rhit.EventPageController()
  }

  else if (document.querySelector("#profilePage")){

    rhit.profilePageModel = new rhit.ProfilePageModel();
    new rhit.ProfilePageController();
  }

  else if (document.querySelector("#profileSettingsPage")){

    rhit.settingsPageModel = new rhit.SettingsPageModel();
    new rhit.SettingsPageController();
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Main ---------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.main = function(){

  rhit.loginPageModel = new rhit.LoginPageModel();
  rhit.loginPageModel.beginListening(() => {
    
    rhit.checkForRedirects();
    rhit.initializePage();
    googleTranslateElementInit();
  });
}

rhit.main();