
var rhit = rhit || {};

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

	beginListenting(changeListener){

	}

	stopListening(){

	}

	signIn(){

	}

	signOut(){

	}

	isSignedIn(){

	}

	get uid(){

	}
}

rhit.main = function(){

}

rhit.main();