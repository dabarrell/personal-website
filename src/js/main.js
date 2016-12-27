
$(function () {
  var source   = $("#resume-item-template").html();
  var template = Handlebars.compile(source);
  var data = { item: [
      {
        "logoUrl": "img/uom-logo.jpg",
        "title": "Master of Engineering (Software)",
        "subtitle": "University of Melbourne",
        "dates": "2016 - Present",
        "location": "Melbourne, AUS",
        "info": "Hello"
      },
      {
        "logoUrl": "img/uom-logo.jpg",
        "title": "Bachelor of Science (Electrical Systems)",
        "subtitle": "University of Melbourne",
        "dates": "2012 - 2015",
        "location": "Melbourne, AUS",
        "info": "Hello"
      }
    ]};
  $(".resume-item-placeholder").html(template(data));
  console.log(source);
});
