const jquery = require('jquery');
$ = window.$ = window.jQuery = jquery;

//var endpoint = 'https://cors-anywhere.small-service.gpeastasia.org/https://cloud.greentw.greenpeace.org/websign-dev1';
var endpoint = 'https://cloud.greenhk.greenpeace.org/websign';

var collectFormValues = () => {
  let dict = {}

  // collect url params
  let searchParams = new URL(window.location.href).searchParams;
  let urlParams2CRMFields = {
    utm_medium: 'UtmMedium',
    utm_source: 'UtmSource',
    utm_campaign: 'UtmCampaign',
    utm_content: 'UtmContent',
    utm_term: 'UtmTerm'
  }
  searchParams.forEach((v, k) => {
    if (k in urlParams2CRMFields) {
      dict[urlParams2CRMFields[k]] = v
    } else {
        dict[k] = v
    }
  });

  // read in the form values
  document.querySelectorAll("#mc-form input,select").forEach(function (el, idx) {
    if (el.type==="checkbox") {
      dict[el.name] = el.checked
    } else {
      dict[el.name] = el.value
    }
  })

  // collect availanle timeslot
  let availableTimeslots = []
  document.querySelectorAll('input[name="AvailableTimeslot"]:checked').forEach((el) => {
    availableTimeslots.push(el.value)
  })

  // add extra fields
  dict['Fundraiser__c'] = dict.fundraiserId;
  dict['CampaignData1__c'] = dict.fundraiserId;
  dict['CampaignData2__c'] = availableTimeslots.join(',');  
  dict['CampaignData4__c'] = JSON.stringify({
    Fundraiser__c: dict.fundraiserId,
    availableTimeslots: availableTimeslots    
  });
  dict['CampaignData5__c'] = window.location.href;

  // wrap into FormData
  var formData = new FormData();
  for (var k in dict) {
    //console.log(k, dict[k])
    formData.append(k, dict[k]);
  }

  return formData
}

// Form validation
const formValidate = () => {    
  require('jquery-validation');    

	$.validator.addMethod(
    'email',
    function(value, element){
      return this.optional(element) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/i.test(value);
    },
    'Email 格式錯誤'
  );
  
  $.validator.addMethod(
    'hk-phone',
    function (value) {    
      if (!value) {
        return false;
      } else if (value.toString().length !== 8) {
        return false;
      }

      if (
        value.toString().length === 8 &&
        $('#MobileCountryCode').val() === "852"
      ) {
        const regex = /^[2,3,5,6,8,9]{1}[0-9]{7}$/i;
        if (!regex.test(value.toString())) {
         return false;
        }
      }

      if (
        value.toString().length === 8 &&
        $('#MobileCountryCode').val() === "853"
      ) {
        const regex = /^[6]{1}[0-9]{7}$/i;
        if (!regex.test(value.toString())) {
          return false;
        }        
      }  
            
      return true;
    },
    "請填上有效手提號碼"
  );

  $.validator.addClassRules({ // connect it to a css class
    "email": {email: true},
    "hk-phone" : { "hk-phone" : true }
  });

  $.extend($.validator.messages, {
    required: "必填欄位"
  });
  
  $("#mc-form").validate({       
    submitHandler: function() {
      //console.log('submitHandler');
      showFullPageLoading();
      var formData = collectFormValues();  
      //console.log("Fetch sending form", formData)

      fetch(endpoint, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(response => {
        if (response) {              										                
          if (response.Supporter) {
            // add tracking code here        
            //console.log(response);
            showFullPageMessage("提交成功", "#000", "#fff", true);   
          }
        }
        hideFullPageLoading();
      })
      .catch(error => {
        console.log("fetch error");
        console.error(error);
        hideFullPageLoading();
        showFullPageMessage("提交發生錯誤", "#fff", "#ff8100", false);   
      })
    }
  });
}
/*
document.querySelector(".send-fetch-form-btn").addEventListener('click', () => {
  showFullPageLoading();

  var formData = collectFormValues();
  console.log("Fetch sending form", formData)

  fetch(endpoint, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(response => {
    if (response) {              										                
      if (response.Supporter) {
        // add tracking code here        
        console.log(response);
        showFullPageMessage("提交成功", "#000", "#fff", true);   
      }
    }
    hideFullPageLoading();
  })
  .catch(error => {
    console.log("fetch error");
    console.error(error);
    hideFullPageMessage();
  })
})
*/

/**
 * This is a full page loading animation	 
   */
const showFullPageLoading = () => {
  if ( !document.querySelector("#page-loading")) {
    document.querySelector("body").insertAdjacentHTML('beforeend', `
      <div id="page-loading" class="hide">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>`);
  }

  setTimeout(() => { // to enable the transition
    document.querySelector("#page-loading").classList.remove("hide")
  }, 0)
}
/**
 * Hide the full page loading
 */
const hideFullPageLoading = () => {
  document.querySelector("#page-loading").classList.add("hide")

  setTimeout(() => {
    document.querySelector("#page-loading").remove()
  }, 1100)
}
/**
 * This is a full page message for DD fundraiserId
   */
const showFullPageMessage = (msg, color, bgcolor, showBtn) => {
  if ( !document.querySelector("#page-message")) {
    var btn = "";
    if (showBtn) {
      btn = `<div><button onclick="$('#page-message').hide();">OK</botton></div>`;
    }

    document.querySelector("body").insertAdjacentHTML('beforeend', `
      <div id="page-message" class="hide">
      <div class="msg-box" style="color:${color}; background-color:${bgcolor}">
        <p>${msg}</p>
        ${btn}
      </div>`);
  }

  setTimeout(() => { // to enable the transition
    document.querySelector("#page-message").classList.remove("hide")
  }, 0)
}
/**
 * Hide the full page message
 */
 const hideFullPageMessage = () => {
  document.querySelector("#page-message").classList.add("hide")

  setTimeout(() => {
    document.querySelector("#page-message").remove()
  }, 1100)
}

/*
 * Mailcheck
 */
let domains = [
	"me.com",
	"outlook.com",
	"netvigator.com",
	"cloud.com",
	"live.hk",
	"msn.com",
	"gmail.com",
	"hotmail.com",
	"ymail.com",
	"yahoo.com",
	"yahoo.com.tw",
	"yahoo.com.hk"
];
let topLevelDomains = ["com", "net", "org"];
let email = document.getElementById("Email");

var Mailcheck = require('mailcheck');
email.onblur = function(){
  //console.log('blur');
	if (!document.getElementById("email-suggestion")) {
		Mailcheck.run({
			email: email.value,
			domains: domains,                       // optional
			topLevelDomains: topLevelDomains,       // optional
			suggested: function(suggestion) {		
				email.insertAdjacentHTML('afterend', `<div id="email-suggestion" style="font-size:small; color:blue; line-height:2rem;">您想輸入的是 <strong id="emailSuggestion">${suggestion.full}</strong> 嗎？</div>`);
				
				document.getElementById("email-suggestion").onclick = function() {
					email.value = document.getElementById("emailSuggestion").innerText;
					document.getElementById("email-suggestion").remove();					
				};
			},
			empty: function() {
				this.emailSuggestion = null;
			}
		});
	}
}

window.addEventListener('DOMContentLoaded', (event) => {
  // create the year options
  
	let currYear = new Date().getFullYear();
  let obj = document.getElementById('Birthdate');
  for (var i = 0; i < 100; i++) {
    //let option = `<option value="${currYear-i}-01-01">${currYear-i}</option>`;    
    obj.add(new Option(currYear-i, `${currYear-i}-01-01`));
  }
  obj.selectedIndex = 21;
  
  // let obj = document.getElementById('Birthdate');
  // let nowYear = new Date().getFullYear();
  // let targetYear = nowYear - 110;
  // for (var i = nowYear - 20; i >= targetYear; i--) {
  //   await optionYear.push({ label: i, value: i.toString() });
  // }

  // check fundraiserId in urlParams
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const fundraiserId = urlParams.get('fundraiserId');
  //console.log(fundraiserId);
  if (!fundraiserId) {
    showFullPageMessage("請確認籌款幹事編號", "#fff", "#ff8100", false);   
  } else if (!new RegExp(/^[A-Za-z0-9]{18}$/).test(fundraiserId)) {
    showFullPageMessage("請確認籌款幹事編號格式", "#fff", "#ff8100", false);   
  }
  
  formValidate();
});