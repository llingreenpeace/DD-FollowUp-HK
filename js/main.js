var url = 'https://cors-anywhere.small-service.gpeastasia.org/https://cloud.greentw.greenpeace.org/websign';
// var url = 'https://cors-anywhere.small-service.gpeastasia.org/https://cloud.greenhk.greenpeace.org/websign-dummy';

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
  document.querySelectorAll("#mc-form input").forEach(function (el, idx) {
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
  dict['CampaignData1__c'] = dict.fundraiserId;
  dict['CampaignData2__c'] = availableTimeslots.join(',');
  dict['CampaignData4__c'] = JSON.stringify({
    fundraiserId: dict.fundraiserId,
    availableTimeslots: availableTimeslots
  });
  dict['CampaignData5__c'] = window.location.href;

  // wrap into FormData
  var formData = new FormData();
  for (var k in dict) {
    console.log(k, dict[k])
    formData.append(k, dict[k]);
  }

  return formData
}

document.querySelector(".send-fetch-form-btn").addEventListener('click', () => {
  var formData = collectFormValues();
  console.log("Fetch sending form", formData)

  fetch(url, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(response => {
    if (response) {
      console.log('fetch response', response);
    }
  })
  .catch(error => {
    console.log("fetch error")
    console.error(error)
  })
})
