// TODO verify user action for critical operations (delete event/timeline/profile)
// TODO do rest of search functionality
// TODO system test before Monday

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
rhit.FB_KEY_CONTRIBUTORS = "Contributors";
rhit.FB_KEY_FAVORITED_BY = "Favorited By";
rhit.FB_KEY_CREATED_EVENTS_NAME = "Created Events Name";
rhit.FB_KEY_CREATED_EVENTS_PARAMS = "Created Events Params";
rhit.FB_KEY_FAVORITE_EVENTS_NAME = "Favorite Events Name";
rhit.FB_KEY_FAVORITE_EVENTS_PARAMS = "Favorite Events Params";
rhit.FB_KEY_LANGUAGE = "Language";

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

// --------------------------------------------------------------------------------------------------------------------------------------
// Searching ------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.searching = function(inputtxt){
  let re = /^[0-9]+$/;
  if (document.querySelector("#mainTimelinePage")){
    console.log("Main page searching for:", inputtxt);
    // var  = inputtxt.toLowerCase();
    let index =-1;
    var divs = document.querySelector("#timelineListContainer").getElementsByTagName("h5");
    console.log(divs);
    for (var i = 0; i < divs.length; i++) {
      // let re =`/${inputtxt}/`;
      var pattern = new RegExp(inputtxt, "i");
      // console.log(pattern);
      let conte =divs[i].innerHTML;
        if (pattern.test(conte)) {
          index = i;
          divs[i].style.color = "blue";
          let a = divs[i].parentElement;
          // console.log(a[0]);
          a.getElementsByTagName("h5")[0].style.color = "blue";
          a.getElementsByTagName("button")[0].click();
          console.log("founded");
          // break;
      } 
    }  
    if(index == -1)alert('Sorry. Please try another word.');
   
  }
  if (document.querySelector("#timelinePage")){
    // console.log("search time:", document.querySelector("#searchTime").checked );
    // console.log("search Name:",document.querySelector("#searchName").checked );
    if(document.querySelector("#searchName").checked === true)
    {
      console.log("Timeline page searching for Name:", inputtxt);
      var pattern = new RegExp(inputtxt +'$', "i");
      let index =-1;
      var divs = document.querySelector("#eventListContainer").getElementsByTagName("li");
      console.log(divs[0]);
      for (var i = 0; i < divs.length; i++) {
          if (pattern.test(divs[i].innerHTML.split(": ")[1])) {
            index = i;
          //   // divs[i].scrollIntoView();
            divs[i].style.color = "blue";
            let a = divs[i].parentElement.parentElement.parentElement;
            a.getElementsByTagName("h5")[0].style.color = "blue";

           a.getElementsByTagName("button")[0].click();
            // console.log(b);
            // let c =  let b = console.log(c);
            console.log("founded");
            // break;
        } 
      }  
      if(index == -1)alert('Sorry. Please try another word.');
    }else if(document.querySelector("#searchTime").checked === true && re.test(inputtxt))
    {
      // console.log("Timeline page searching for Time:", inputtxt);
      // console.log("Timeline page searching for Name:", inputtxt);
      var pattern = inputtxt;
      let index =-1;
      var divs = document.querySelector("#eventListContainer").getElementsByTagName("h5");
      //Half way
      // let re = /([^-]+)/;
      // let back =/(\d+[^-])/;
      // console.log(divs[5].innerHTML);
      // let result = re.exec(divs[5].innerHTML);
      // let result2 = back.exec(divs[5].innerHTML);
      // console.log(divs[5].innerHTML.rpartition('-')[1]);
      
 
      // // console.log(divs);
      for (var i = 0; i < divs.length; i++) {
        var res = divs[i].innerHTML.split("-");
        // console.log(res[0]);
        // console.log(res[1]);
          if(inputtxt<=res[1] && inputtxt >= res[0]) {
            index = i;
            // divs[i].scrollIntoView();
            divs[i].style.color = "blue";
            divs[i].parentElement.getElementsByTagName("button")[0].click();
            console.log("founded");
            // break;
        } 
      }  
      if(index == -1)alert('Sorry. Please try another word.');
     
      }else{
      alert('Please input numeric characters only');
      }

     
    
  }
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

    document.querySelector("#submitSearch").addEventListener("click", () => {
       setTimeout(location.reload(),2000);
     
      rhit.searching(document.querySelector("#inputSearchString").value);
    });

    document.querySelector("#submitAddTimeline").addEventListener("click", () => {

      const title = document.querySelector("#inputTimelineTitle").value.trim();
      const description = document.querySelector("#inputTimelineDescription").value.trim();
      const privateEdit = document.querySelector("#privateEditPermission").checked;
      const privateView = document.querySelector("#privateViewPermission").checked;

      if (title == ""){

        alert("Invalid title");
        return;
      }

      if (description == ""){

        alert("Invalid description");
        return;
      }

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

    if (! rhit.loginPageModel.isGuest) {
      
      document.querySelector("#profilePicture").hidden = false;
      document.querySelector("#profilePicture").src = rhit.loginPageModel.image;
    }

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
                                    <i class="material-icons">keyboard_arrow_right</i>
                                  </button>
                                  `);

    button.addEventListener("click", () => {

      const item = document.querySelector(`#descriptionOfItem${index}`).parentElement;
      item.hidden = ! item.hidden;

      if (button.querySelector(".material-icons").textContent == "keyboard_arrow_down"){

        button.querySelector(".material-icons").textContent = "keyboard_arrow_right";
      }

      else {

        button.querySelector(".material-icons").textContent = "keyboard_arrow_down";
      }
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

    // mouseup event doesn't work on mobile. 
    document.querySelector("#zoomSlider").addEventListener("touchend", () => {

      this.updateView();
    });

    document.querySelector("#zoomSlider").addEventListener("mouseup", () => {

      this.updateView();
    });

    document.querySelector("#profilePicture").addEventListener("click", () => {

      if (! rhit.loginPageModel.isGuest) window.location.href = `/profile.html`;
    });

    document.querySelector("#submitSearch").addEventListener("click", () => {
      // location.reload();
      // setTimeout(location.reload(),2000);
      // setTimeout( 
     rhit.searching( document.querySelector("#inputSearchString").value);
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

      const startDate = document.querySelector("#inputStartDate").value.trim();
      const endDate = document.querySelector("#inputEndDate").value.trim();
      const title = document.querySelector("#inputEventTitle").value.trim();
      const imageURL = document.querySelector("#inputImageURL").value.trim();
      const description = document.querySelector("#inputEventDescription").value.trim();

      if (startDate == "" || startDate <= 0 || isNaN(parseInt(startDate))){

        alert("Invalid start date");
        return;
      }

      if (endDate == "" || endDate <= 0 || isNaN(parseInt(endDate))){

        alert("Invalid end date");
        return;
      }

      if (endDate < startDate){

        alert("Invalid date range");
        return;
      }

      if (title == ""){

        alert("Invalid title");
        return;
      }

      if (description == ""){

        alert("Invalid description");
        return;
      }

      rhit.singleTimelineModel.createEvent(startDate, endDate, title, imageURL, description);
    });

    document.querySelector("#submitUpdateTimeline").addEventListener("click", () => {

      const title = document.querySelector("#inputTimelineTitle").value.trim();
      const description = document.querySelector("#inputTimelineDescription").value.trim();
      const privateEdit = document.querySelector("#privateEditPermission").checked;
      const privateView = document.querySelector("#privateViewPermission").checked;

      if (title == ""){

        alert("Invalid title");
        return;
      }

      if (description == ""){

        alert("Invalid description");
        return;
      }

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

    if (! rhit.loginPageModel.isGuest) {
      
      document.querySelector("#profilePicture").hidden = false;
      document.querySelector("#profilePicture").src = rhit.loginPageModel.image;
    }

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
                                    <i class="material-icons">keyboard_arrow_right</i>
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

      if (button.querySelector(".material-icons").textContent == "keyboard_arrow_down"){

        button.querySelector(".material-icons").textContent = "keyboard_arrow_right";
      }

      else {

        button.querySelector(".material-icons").textContent = "keyboard_arrow_down";
      }
    });

    group.prepend(button);

    return group;
  }
  
  _createEventItem(event){

    const title = htmlToElement(`<li class="timelineEventItemTitle">${event.startDate}-${event.endDate}: ${event.title}</li>`);

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
      [rhit.FB_KEY_FAVORITED_BY]: [],
      [rhit.FB_KEY_CONTRIBUTORS]: [rhit.loginPageModel.username],
    })
    .then((docRef) => {

      console.log("Event document Written with ID: ", docRef.id);

      rhit.loginPageModel.getUserDoc().update({

        [rhit.FB_KEY_CREATED_EVENTS_PARAMS]: firebase.firestore.FieldValue.arrayUnion(
          `?eventID=${docRef.id}&timelineID=${this._timelineID}&privateEdit=${this.privateEdit}`),
        [rhit.FB_KEY_CREATED_EVENTS_NAME]: firebase.firestore.FieldValue.arrayUnion(title),
      })
      .then(() => {

        console.log("successfully added contributor to new event");
        window.location.href = `/detail.html?timelineID=${this.id}&eventID=${docRef.id}`;
      })
      .catch((error) => {

        console.log("Error adding contributor to new event");
      });
    })
    .catch((error) => {

      console.log("Error adding event document: ", error);
    });
  }
  
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

    let contributorsButton = document.querySelector("#contributorsButton")
    contributorsButton.addEventListener("click", () => {

      if (contributorsButton.querySelector(".material-icons").textContent == "keyboard_arrow_right"){

        contributorsButton.querySelector(".material-icons").textContent = "keyboard_arrow_down"
      }

      else {

        contributorsButton.querySelector(".material-icons").textContent = "keyboard_arrow_right"
      }

      let section = document.querySelector("#contributorsList");
      section.hidden = ! section.hidden;
    });

    document.querySelector("#favoriteButton").addEventListener("click", () => {

      let favorited = rhit.eventPageModel.favoritedByContains(rhit.loginPageModel.uid);
      if (favorited) rhit.eventPageModel.removeFavoritedBy(rhit.loginPageModel.uid);
      else rhit.eventPageModel.addFavoritedBy(rhit.loginPageModel.uid); 
    });

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

      const startDate = document.querySelector("#inputStartDate").value.trim();
      const endDate = document.querySelector("#inputEndDate").value.trim();
      const title = document.querySelector("#inputEventTitle").value.trim();
      const imageURL = document.querySelector("#inputImageURL").value.trim();
      const description = document.querySelector("#inputEventDescription").value.trim();

      if (startDate == "" || startDate <= 0 || isNaN(parseInt(startDate))){

        alert("Invalid start date");
        return;
      }

      if (endDate == "" || endDate <= 0 || isNaN(parseInt(endDate))){

        alert("Invalid end date");
        return;
      }

      if (endDate < startDate){

        alert("Invalid date range");
        return;
      }

      if (title == ""){

        alert("Invalid title");
        return;
      }

      if (description == ""){

        alert("Invalid description");
        return;
      }

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

    if (! rhit.loginPageModel.isGuest) {
      
      document.querySelector("#profilePicture").hidden = false;
      document.querySelector("#profilePicture").src = rhit.loginPageModel.image;
    }

    let favorited = rhit.eventPageModel.favoritedByContains(rhit.loginPageModel.uid);
    if (favorited) document.querySelector("#favoriteIcon").style.color = "#6091F1";
    else document.querySelector("#favoriteIcon").style.color = "#FFFFFF";

    if (rhit.eventPageModel.author == rhit.loginPageModel.uid){

      document.querySelector("#deleteEventButton").hidden = false;
      document.querySelector("#updateEventButton").hidden = false;
    }

    if (! rhit.eventPageModel.privateEdit && ! rhit.loginPageModel.isGuest){

      document.querySelector("#updateEventButton").hidden = false;
    }

    if (! rhit.loginPageModel.isGuest){

      document.querySelector("#favoriteButton").hidden = false;
    }

    document.querySelector("#eventDate").textContent = `${rhit.eventPageModel.startDate}-${rhit.eventPageModel.endDate}`;
    document.querySelector("#eventName").textContent = rhit.eventPageModel.title;
    document.querySelector("#eventImage").src = rhit.eventPageModel.imageURL;
    document.querySelector("#textDescription").textContent = rhit.eventPageModel.description;

    let newSection = htmlToElement(`<ul id="contributorsList" hidden></ul>`);

    for (let i = 0; i < rhit.eventPageModel.contributorListLength; i++){

      let contributor = rhit.eventPageModel.getContributorAtIndex(i);
      let item = this._createContributorItem(contributor);
      newSection.appendChild(item);
    }

    let oldSection = document.querySelector("#contributorsList");
    oldSection.removeAttribute("id");
    oldSection.parentElement.appendChild(newSection);
    oldSection.parentElement.removeChild(oldSection);
  }

  _createContributorItem(name){

    return htmlToElement(`<li>${name}</li>`);
  }
}

rhit.EventPageModel = class {

	constructor(timelineID, eventID, privateEdit){

    this._timelineID = timelineID;
    this._privateEdit = privateEdit == "true";
    this._eventID = eventID;

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
      [rhit.FB_KEY_CONTRIBUTORS]: firebase.firestore.FieldValue.arrayUnion(rhit.loginPageModel.username),
    })
    .then((docRef) => {

      console.log("event updated successfully");
    })
    .catch((error) => {

      console.log("Error updating event document: ", error);
    });
	}

  addFavoritedBy(uid){

    this._ref.update({

      [rhit.FB_KEY_FAVORITED_BY]: firebase.firestore.FieldValue.arrayUnion(uid),
    })
    .then((docRef) => {
    
      console.log("Added favorite successfully");
    })
    .catch((error) => {

      console.log("Error adding favorite");
    });

    rhit.loginPageModel.getUserDoc().update({

      [rhit.FB_KEY_FAVORITE_EVENTS_NAME]: firebase.firestore.FieldValue.arrayUnion(this.title),
      [rhit.FB_KEY_FAVORITE_EVENTS_PARAMS]: firebase.firestore.FieldValue.arrayUnion(
        `?eventID=${this._eventID}&timelineID=${this._timelineID}&privateEdit=${this._privateEdit}`),
    });
  }

  removeFavoritedBy(uid){

    this._ref.update({

      [rhit.FB_KEY_FAVORITED_BY]: firebase.firestore.FieldValue.arrayRemove(uid),
    })
    .then((docRef) => {
    
      console.log("Removed favorite successfully");
    })
    .catch((error) => {

      console.log("Error removing favorite");
    });

    rhit.loginPageModel.getUserDoc().update({

      [rhit.FB_KEY_FAVORITE_EVENTS_NAME]: firebase.firestore.FieldValue.arrayRemove(this.title),
      [rhit.FB_KEY_FAVORITE_EVENTS_PARAMS]: firebase.firestore.FieldValue.arrayRemove(
        `?eventID=${this._eventID}&timelineID=${this._timelineID}&privateEdit=${this._privateEdit}`),
    });
  }

  favoritedByContains(uid){

    return this._documentSnapshot.get(rhit.FB_KEY_FAVORITED_BY).find((element) => {
      
      return uid == element; 
    });
  }

  getContributorAtIndex(index){

    return this._documentSnapshot.get(rhit.FB_KEY_CONTRIBUTORS)[index];
  }

  get contributorListLength(){

    return this._documentSnapshot.get(rhit.FB_KEY_CONTRIBUTORS).length;
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

    let createdButton = document.querySelector("#createdEventsButton")
    createdButton.addEventListener("click", () => {

      if (createdButton.querySelector(".material-icons").textContent == "keyboard_arrow_right"){

        createdButton.querySelector(".material-icons").textContent = "keyboard_arrow_down"
      }

      else {

        createdButton.querySelector(".material-icons").textContent = "keyboard_arrow_right"
      }

      let section = document.querySelector("#createdEventsList");
      section.hidden = ! section.hidden;
    });

    let favoriteButton = document.querySelector("#favoriteEventsButton")
    favoriteButton.addEventListener("click", () => {

      if (favoriteButton.querySelector(".material-icons").textContent == "keyboard_arrow_right"){

        favoriteButton.querySelector(".material-icons").textContent = "keyboard_arrow_down"
      }

      else {

        favoriteButton.querySelector(".material-icons").textContent = "keyboard_arrow_right"
      }

      let section = document.querySelector("#favoriteEventsList");
      section.hidden = ! section.hidden;
    });

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

      let username = document.querySelector("#modalUsername").value.trim();
      let imageURL = document.querySelector("#modalImageURL").value.trim();
      let location = document.querySelector("#modalLocation").value;
      let age = document.querySelector("#modalAge").value.trim();

      if (username == "") {
        
        alert("Invalid Username");
        return;
      }

      if (age <= 0 || age >= 130 || age == "" || isNaN(parseInt(age))){

        alert("Invalid age");
        return;
      }

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

    let newFavorites = htmlToElement(`<ul id="favoriteEventsList" hidden></ul>`);

    for (let i = 0; i < rhit.profilePageModel.favoriteEventsLength; i++){

      let eventName = rhit.profilePageModel.getFavoriteEventNameAtIndex(i);
      let eventParams = rhit.profilePageModel.getFavoriteEventParamsAtIndex(i);
      let item = this._createEventBulletItem(eventName, eventParams);
      newFavorites.appendChild(item);
    }

    let oldFavorites = document.querySelector("#favoriteEventsList");
    oldFavorites.removeAttribute("id");
    oldFavorites.parentElement.appendChild(newFavorites);
    oldFavorites.parentElement.removeChild(oldFavorites);


    let newCreated = htmlToElement(`<ul id="createdEventsList" hidden></ul>`);

    for (let i = 0; i < rhit.profilePageModel.createdEventsLength; i++){

      let eventName = rhit.profilePageModel.getCreatedEventNameAtIndex(i);
      let eventParams = rhit.profilePageModel.getCreatedEventParamsAtIndex(i);
      let item = this._createEventBulletItem(eventName, eventParams);
      newCreated.appendChild(item);
    }

    let oldCreated = document.querySelector("#createdEventsList");
    oldCreated.removeAttribute("id");
    oldCreated.parentElement.appendChild(newCreated);
    oldCreated.parentElement.removeChild(oldCreated);
	}

  _createEventBulletItem(name, params){

    let nameButton = htmlToElement(`<button class="eventBulletItem">${name}</button>`);
    nameButton.addEventListener("click", () => {

      window.location.href = `detail.html${params}`;
    });

    let item = htmlToElement(`<li></li>`);
    item.appendChild(nameButton);

    return item;
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

      return rhit.loginPageModel.updateProfile(username, imageURL);
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

	getFavoriteEventNameAtIndex(index){

    return this._documentSnapshot.get(rhit.FB_KEY_FAVORITE_EVENTS_NAME)[index];
	}

	getFavoriteEventParamsAtIndex(index){

    return this._documentSnapshot.get(rhit.FB_KEY_FAVORITE_EVENTS_PARAMS)[index];
	}

  get favoriteEventsLength(){

    return this._documentSnapshot.get(rhit.FB_KEY_FAVORITE_EVENTS_PARAMS).length;
  }

	getCreatedEventNameAtIndex(index){

    return this._documentSnapshot.get(rhit.FB_KEY_CREATED_EVENTS_NAME)[index];
	}

	getCreatedEventParamsAtIndex(index){

    return this._documentSnapshot.get(rhit.FB_KEY_CREATED_EVENTS_PARAMS)[index];
	}

  get createdEventsLength(){

    return this._documentSnapshot.get(rhit.FB_KEY_CREATED_EVENTS_PARAMS).length;
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Profile Settings Page ----------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

rhit.SettingsPageController = class {

  constructor(){

    let translateSelect = document.querySelector(".goog-te-combo");
    translateSelect.addEventListener("click", () => {

      rhit.settingsPageModel.setLanguage(translateSelect.value);
    });

    document.querySelector("#submitUpdatePassword").addEventListener("click", () => {
    
      const oldPassword = document.querySelector("#oldPassword").value.trim();
      const newPassword = document.querySelector("#newPassword").value.trim();

      rhit.settingsPageModel.setPassword(oldPassword, newPassword);
    });

    $("#updatePassword").on("show.bs.modal", (event) => {

      document.querySelector("#oldPassword").value = "";
      document.querySelector("#newPassword").value = "";
    });

    $("#updatePassword").on("shown.bs.modal", (event) => {

      document.querySelector("#oldPassword").focus();
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

  setLanguage(language){

    rhit.loginPageModel.getUserDoc().update({

      [rhit.FB_KEY_LANGUAGE]: language,
    })
    .then(() => {

      console.log("Language updated successfully.");
    })
    .catch((error) => {

      console.log("Error while updating language: ", error);
    });
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

  setPassword(oldPassword, newPassword){

    let user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(

      rhit.loginPageModel.email, 
      oldPassword,
    );

    user.reauthenticateWithCredential(credential)
    .then(() => {

      return user.updatePassword(newPassword);
    })
    .then(() => {

      console.log("Password successfully updated.");
      alert("Password Successfully Changed.");
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
    
     
      if (username == "") {
        
        alert("Invalid Username");
        return;
      }

      if (age <= 0 || age >= 130 || age == "" || isNaN(parseInt(age))){

        alert("Invalid age");
        return;
      }

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

      this._setLanguage();

      if (this._profileObject){

        this._createProfile()
        .then(() => {

          return this._user.updateProfile({

            displayName: this._profileObject[rhit.FB_KEY_USERNAME],
            photoURL: this._profileObject[rhit.FB_KEY_IMAGE_URL],
          });
        })
        .then(() => {

          changeListener();
        });
      }

      else changeListener();
    });
	}

  _setLanguage(){

    if (this._user){

      let translateSelect = document.querySelector(".goog-te-combo");
      this.getUserDoc().onSnapshot((doc) => {

        if (doc.exists && translateSelect){
  
          translateSelect.value = doc.get(rhit.FB_KEY_LANGUAGE);

          // https://stackoverflow.com/questions/78932/how-do-i-programmatically-set-the-value-of-a-select-box-element-using-javascript
          // Programatically setting value of select tag
          translateSelect.dispatchEvent(new Event('change'));
          console.log("HERE");
        }
      });
    }
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
        [rhit.FB_KEY_CREATED_EVENTS_NAME]: [],
        [rhit.FB_KEY_FAVORITE_EVENTS_NAME]: [],
        [rhit.FB_KEY_CREATED_EVENTS_PARAMS]: [],
        [rhit.FB_KEY_FAVORITE_EVENTS_PARAMS]: [],
        [rhit.FB_KEY_LANGUAGE]: "en",
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
      alert("Incorrect Sign in Credentials.");
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

  getUserDoc(){

    return rhit.loginPageModel._ref.doc(rhit.loginPageModel.uid);
  }

	get isSignedIn(){

    return !!this._user;
  }
  
  get isGuest(){

    return this._user.isAnonymous;
  }

  updateProfile(name, image){

    return this._user.updateProfile({

      displayName: name,
      photoURL: image,
    });
  }

  get username(){

    return this._user.displayName;
  }

  get image(){

    return this._user.photoURL;
  }

  get email(){

    return this._user.email;
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
    new rhit.EventPageController();
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