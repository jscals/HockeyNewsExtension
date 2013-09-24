/*
    Author: Jonathan Scalise
    Disclaimer: TSN images, name, and stories are property of Bell Media.
*/

/**
 * URL to get TSN RSS Feed
 *
 */
var rssAddress_ = 'http://www.tsn.ca/datafiles/rss/Stories.xml';


/**
 * Sends an XHR GET request to grab the TSN RSS feed. 
 * Gets the response and saves it as an xml string.
 * Sends to filterFeedByCategory() to be filtered per the specified category.
 * 
 */
  var getRSSFeed = function() {
      var req = new XMLHttpRequest();
      req.open("GET", this.rssAddress_, true);
      req.send(null);
      req.onreadystatechange = function () {
          if (req.readyState === 4) {
              filterFeedByCategory(req.responseText, "NHL");
          }
      };
  };
  

 /* 
  * Builds a NodeList of each element (story) that is in the specified category
  * sends it off to showFeed() to format and attach to DOM. 
  * @params {String, String} an xml formatted string of all stories and a specified category.
  */
  var filterFeedByCategory = function(xmlFeed, category){

      //parse xml formatted string into xmlDocument object. 
      //(could have also used var allStories = xmlFeed.querySelectorAll('item');, still a NodeList
      var parser = new DOMParser(); 
      var xmlDocObj = parser.parseFromString(xmlFeed, "text/xml");

      //Get a node list of all the stories. 
      var allStories = $(xmlDocObj).find("item");
      
      //Create a document fragment to hold all the filtered stories.
      var filteredStories = document.createDocumentFragment();

      //filter the stories
      for(var i = 0; i< allStories.length; i++){
          var currentStory = $(allStories).get(i);
          var storyCategory = $(currentStory).find("category").text();
          
          if(storyCategory === category){
              filteredStories.appendChild(currentStory);   
          }
      }
      
      //Check to see if there are any stories to display
      if(filteredStories.childNodes.length > 0){
          showFeed(filteredStories.childNodes);
      }
      else{
          nothingToShow();
      }
      
  };


  /**
   * Loops through each story and creates nessesary divs, extracts and adds relevant story info, 
   * and binds each div to the DOM. 
   * @param {nodeList} filteredStories contains a DOM element node for each filtered rss story
   */
  var showFeed = function (filteredStories) {

      for(var i = 0; i< filteredStories.length; i++){
       
          var currStory = $(filteredStories).get(i);
          
          //get the relevant information from each story element in the nodeList
          var storyTitle = $(currStory).find("title").text();
          var storyUrl = $(currStory).find("link").text();
          var scannedDate = $(currStory).find("pubDate").text();
          var storyImgUrl = $(currStory).find("enclosure").attr("url");
          
          //Create new date object to localize the time zone for the user. 
          var storyDate = new Date(scannedDate);
          
          //Calculate am/pm time, set relevant variables.
          var hour = storyDate.getHours();
          var minutes = storyDate.getMinutes() + "";
          var prefix = (hour < 12) ? "am" : "pm";
          if (hour === 0){
              hour = "12";
          };
          if(hour > 12){
              hour = hour - 12;
          };
          if(minutes.length === 1){
              minutes = "0" + minutes;
          }

          //format date string
          storyDate = storyDate.getDate() + "/" + (storyDate.getMonth() + 1) + "/" + storyDate.getFullYear() + " " + 
                      hour + ":" + minutes + prefix;


          //create the new div element that the current story will reside in.
          var storyDiv = document.createElement("div");
          storyDiv.setAttribute("class", "story");

          //create HTML elements and format with story information... 
          var imgTag = document.createElement("img");
          imgTag.setAttribute("src", storyImgUrl);
          imgTag.setAttribute("alt", "Image Not Available");
          imgTag.setAttribute("class", "picture");

          //create div to hold the date and title elements
          var dateTitleDiv = document.createElement("div");
          dateTitleDiv.setAttribute("class","dateAndTitle");

          var dateTag = document.createElement("p");
          dateTag.appendChild( document.createTextNode(storyDate) );
          dateTag.setAttribute("class", "date");

          var titleAndLinkTag = document.createElement("a");
          titleAndLinkTag.setAttribute("href", storyUrl);
          titleAndLinkTag.setAttribute("class", "title");
          titleAndLinkTag.appendChild( document.createTextNode(storyTitle) );

          dateTitleDiv.appendChild(titleAndLinkTag);
          dateTitleDiv.appendChild(dateTag);

          //Add HTML elements to the created story div tag element.
          storyDiv.appendChild(imgTag);
          storyDiv.appendChild(dateTitleDiv);
          storyDiv.appendChild(document.createElement("br"));
          storyDiv.appendChild(document.createElement("br"));
          
          //append formatted story.
          $("#storyContainer").append(storyDiv);
          
      }
      
      //append all stories to body
      $("#body").append(storyContainer);
      
  };//end showFeed
  
  
  /*
   * Appends a message to the main story container when no stories exist
   * (for the chosen category so far for the day).
   */
  function nothingToShow(){
      var storyContainer = $("#storyContainer");
      storyContainer.css("text-align","center");
      
      var message = document.createElement("p");
      message.innerHTML = "No headlines yet for today, check back again later!";
      message.setAttribute("id","noStoryMessage");
      
      storyContainer.append(message);
  };

      
//Initate ajax when loaded and make header as wide as story container. 
$(document).ready( function() {
           $("#header").width($("storyContainer").width());
          getRSSFeed(); 
 });


//When link clicked, launch story in new window. 
$(document).on( "click", "a", function() {
   var linkUrl = $(this).attr('href');
   window.open(linkUrl,"_blank",[fullscreen='yes']); 
});




