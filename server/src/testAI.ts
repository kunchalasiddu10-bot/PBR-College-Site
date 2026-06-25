export {};
const BASE_URL = 'http://localhost:5000/api/v1';

const authenticate = async (email: string) => {
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password@123',
    }),
  });

  const loginData: any = await loginRes.json();
  if (loginRes.status !== 200 || !loginData.data?.accessToken) {
    throw new Error(`Login failed for ${email}`);
  }
  return loginData.data.accessToken;
};

const runTests = async () => {
  console.log('🏁 Starting AI Assistant Module Integration Tests...');

  try {
    // ----------------- 1. TEST PREFERENCES & PROMPTS CRUD (STUDENT) -----------------
    console.log('➡️ Testing Student Authentication...');
    const studentToken = await authenticate('student@college.edu');
    const studentHeaders = {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    };
    console.log('✅ Student logged in successfully.');

    // Preferences GET
    console.log('➡️ Fetching user preferences...');
    const prefGet = await fetch(`${BASE_URL}/ai/preferences`, { headers: studentHeaders });
    const prefGetData: any = await prefGet.json();
    if (prefGet.status !== 200 || !prefGetData.data?.preferences) {
      throw new Error('Failed to retrieve user preferences');
    }
    console.log('✅ User preferences fetched.');

    // Preferences PATCH
    console.log('➡️ Updating user preferences (voice enabled)...');
    const prefPatch = await fetch(`${BASE_URL}/ai/preferences`, {
      method: 'PATCH',
      headers: studentHeaders,
      body: JSON.stringify({ aiVoiceEnabled: true }),
    });
    const prefPatchData: any = await prefPatch.json();
    if (prefPatch.status !== 200 || prefPatchData.data?.preferences?.aiVoiceEnabled !== true) {
      throw new Error('Failed to update user preferences');
    }
    console.log('✅ User preferences updated successfully.');

    // Saved prompts CREATE
    console.log('➡️ Creating a saved prompt shortcut...');
    const promptCreate = await fetch(`${BASE_URL}/ai/saved-prompts`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        title: 'Check my grades shortcut',
        promptText: 'What is my current semester gpa and overall cgpa status?',
      }),
    });
    const promptCreateData: any = await promptCreate.json();
    if (promptCreate.status !== 201 || !promptCreateData.data?.savedPrompt?._id) {
      throw new Error('Failed to create saved prompt shortcut');
    }
    const createdPromptId = promptCreateData.data.savedPrompt._id;
    console.log(`✅ Saved prompt shortcut created with ID: ${createdPromptId}`);

    // Saved prompts GET
    console.log('➡️ Fetching saved prompt shortcuts...');
    const promptsGet = await fetch(`${BASE_URL}/ai/saved-prompts`, { headers: studentHeaders });
    const promptsGetData: any = await promptsGet.json();
    if (promptsGet.status !== 200 || !Array.isArray(promptsGetData.data?.savedPrompts)) {
      throw new Error('Failed to fetch saved prompts');
    }
    console.log(`✅ Saved prompts fetched. Loaded ${promptsGetData.data.savedPrompts.length} shortcuts.`);

    // Saved prompts DELETE
    console.log(`➡️ Deleting saved prompt shortcut ID: ${createdPromptId}...`);
    const promptDelete = await fetch(`${BASE_URL}/ai/saved-prompts/${createdPromptId}`, {
      method: 'DELETE',
      headers: studentHeaders,
    });
    if (promptDelete.status !== 200) {
      throw new Error('Failed to delete saved prompt shortcut');
    }
    console.log('✅ Saved prompt shortcut deleted successfully.');


    // ----------------- 2. TEST CHAT SESSIONS & RAG INTENTS (STUDENT) -----------------
    // Chat chat session auto-creation
    console.log('➡️ Testing Student RAG chat (timetables class today) with auto session creation...');
    const chatRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ question: 'What is my class timetable today?' }),
    });
    const chatData: any = await chatRes.json();
    if (chatRes.status !== 200 || !chatData.data?.answer || !chatData.data?.sessionId) {
      throw new Error('Failed to execute chat query');
    }
    const activeSessionId = chatData.data.sessionId;
    console.log('✅ Student chat RAG query succeeded.');
    console.log(`   - Generated Answer: "${chatData.data.answer.substring(0, 80)}..."`);
    console.log(`   - Resolved Session ID: ${activeSessionId}`);

    // Query messages in session
    console.log(`➡️ Fetching messages for session ${activeSessionId}...`);
    const messagesRes = await fetch(`${BASE_URL}/ai/sessions/${activeSessionId}/messages`, { headers: studentHeaders });
    const messagesData: any = await messagesRes.json();
    if (messagesRes.status !== 200 || !Array.isArray(messagesData.data?.messages)) {
      throw new Error('Failed to load session messages history');
    }
    console.log(`✅ Loaded ${messagesData.data.messages.length} messages in current chat session.`);

    // Check attendance query
    console.log('➡️ Querying Student attendance details...');
    const chatRes2 = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ question: 'attendance', sessionId: activeSessionId }),
    });
    const chatData2: any = await chatRes2.json();
    if (chatRes2.status !== 200 || !chatData2.data?.answer) {
      throw new Error('Failed to query attendance intent');
    }
    console.log('✅ Student attendance check succeeded.');
    console.log(`   - Generated Answer: "${chatData2.data.answer.substring(0, 85)}..."`);

    // General doubt question check
    console.log('➡️ Querying Student general doubt (e.g. Photosynthesis)...');
    const chatResGen = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ question: 'Explain how photosynthesis works briefly.', sessionId: activeSessionId }),
    });
    const chatDataGen: any = await chatResGen.json();
    if (chatResGen.status !== 200 || !chatDataGen.data?.answer) {
      throw new Error('Failed to query general doubt concept');
    }
    console.log('✅ Student general doubt query succeeded.');
    console.log(`   - Generated Answer: "${chatDataGen.data.answer.substring(0, 150)}..."`);


    // ----------------- 3. TEST ROLE AUTHORIZATION INTEGRITY (FACULTY & ADMIN) -----------------
    // Faculty Login
    console.log('➡️ Testing Faculty Authentication...');
    const facultyToken = await authenticate('faculty@college.edu');
    const facultyHeaders = {
      Authorization: `Bearer ${facultyToken}`,
      'Content-Type': 'application/json',
    };
    console.log('✅ Faculty logged in.');

    console.log('➡️ Querying low attendance list as Faculty...');
    const facChatRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: facultyHeaders,
      body: JSON.stringify({ question: 'Which students have low attendance?' }),
    });
    const facChatData: any = await facChatRes.json();
    if (facChatRes.status !== 200 || !facChatData.data?.answer) {
      throw new Error('Failed to execute Faculty query');
    }
    console.log('✅ Faculty query succeeded.');
    console.log(`   - Generated Answer: "${facChatData.data.answer.substring(0, 85)}..."`);

    // Admin Login
    console.log('➡️ Testing Admin Authentication...');
    const adminToken = await authenticate('admin@college.edu');
    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    };
    console.log('✅ Admin logged in.');

    console.log('➡️ Querying placements summary as Admin...');
    const adminChatRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ question: 'Show placements report' }),
    });
    const adminChatData: any = await adminChatRes.json();
    if (adminChatRes.status !== 200 || !adminChatData.data?.answer) {
      throw new Error('Failed to execute Admin placements query');
    }
    console.log('✅ Admin placements query succeeded.');
    console.log(`   - Generated Answer: "${adminChatData.data.answer.substring(0, 85)}..."`);

    // Cleanup session history
    console.log(`➡️ Cleaning up Student session history for session ${activeSessionId}...`);
    const deleteRes = await fetch(`${BASE_URL}/ai/sessions/${activeSessionId}`, {
      method: 'DELETE',
      headers: studentHeaders,
    });
    if (deleteRes.status !== 200) {
      throw new Error('Failed to delete chat session');
    }
    console.log('✅ Student chat session cleaned successfully.');

    console.log('🎉 All AI Assistant Integration Tests passed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Integration Tests Failed:', error.message || error);
    process.exit(1);
  }
};

runTests();
