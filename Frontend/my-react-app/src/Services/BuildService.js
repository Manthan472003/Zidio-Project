import axios from 'axios'

const API_URL = "http://localhost:8080/build";

//Create a new Build Entry
export const createBuildEntry = (buildEntry) => axios.post(API_URL, buildEntry);

//Get all Build entries
export const fetchAllBuildEntries = () => axios.get(API_URL);

//Get Build Entry By Id
export const getBuildEntryById = (buildId) => axios.get(`${API_URL}/${buildId}`);

//Mark Task Working
export const markTaskWorking = (taskDetails) => axios.post(`${API_URL}/markWorking`, taskDetails);

//Mark Task Not Working
export const markTaskNotWorking = (taskDetails) => axios.post(`${API_URL}/markNotWorking`, taskDetails);

//Check if Task is Working
export const isTaskWorking = (taskDetails) => axios.post(`${API_URL}/task/isWorking`, taskDetails);

//Update Android Link for Build
export const addAndroidLink = (buildId, link) => axios.post(`${API_URL}/addLink/android/${buildId}`, link);

//Get Checked Task Details
export const getCheckedTaskDetails = (buildId, taskName) => axios.get(`${API_URL}/getCheckedTaskDetails/${buildId}`, {taskName});

//Uncheck The Task
export const unCheckTheTask = async(data) => {
  console.log(data.buildId);
  console.log(data.taskName);
  await axios.post(`${API_URL}/unCheckTheTask`, data);
}

//Add Comments to the Task
export const addComments = async (buildId, taskDetails) => {
  try {
    // Create FormData to send text and media files
    const formData = new FormData();
    formData.append('taskName', taskDetails.taskName);
    formData.append('commentText', taskDetails.commentText);
    formData.append('userId', taskDetails.userId);

    // Append media files if they exist
    if (taskDetails.mediaFiles && taskDetails.mediaFiles.length > 0) {
      taskDetails.mediaFiles.forEach(file => {
        formData.append('mediaFiles', file);
      });
    }

    // Make the PUT request with FormData
    const response = await axios.put(`${API_URL}/addComment/${buildId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const getComments = (buildId, taskName) => axios.get(`${API_URL}/getComments/${buildId}?taskName=${taskName}`);
