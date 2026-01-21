import { defineStore } from "pinia";
import { ref } from "vue";

const API_BASE_URL = "http://localhost:3000";

export const useFollowupStore = defineStore("followupStore", () => {
  const followups = ref([]);

  const fetchFollowups = async () => {
	try {
	  const response = await fetch(`${API_BASE_URL}/followups`);
	  if (!response.ok) throw new Error("Failed to fetch follow-ups");
	  followups.value = await response.json();
	  console.log("Follow-ups fetched successfully");
	} catch (error) {
	  console.error("Error fetching follow-ups:", error);
	}
	  };
	  
	    fetchFollowups();

	const FollowupForm = ref({
		id: null,
		patientId: '',
		recordId: '',
		date: '',
		diagnosis: '',
    	symptom: '',
    	treatment: '',
    	notes: '',
	})	

});