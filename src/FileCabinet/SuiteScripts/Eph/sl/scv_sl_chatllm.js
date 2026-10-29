/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget', 'N/llm'],
    (serverWidget, llm) => {
        
        const onRequest = (context) => {
            if (context.request.method === 'GET') {
                let form = serverWidget.createForm({title: 'Chat với GPT'});
                
                let chatWindow = form.addField({
                    id: 'custpage_chatwindow',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Cửa sổ chat'
                });
                chatWindow.defaultValue = "<div id='chatbox' style='height:300px; overflow-y:scroll; border:1px solid #ccc; padding:10px;'></div><input type='text' id='chatinput' style='width:80%;' onkeypress='if(event.keyCode===13) sendMessage();'/><script>const sendMessage=()=>{let msg=document.getElementById('chatinput').value;document.getElementById('chatbox').innerHTML+='<div><b>Bạn:</b> '+msg+'</div>';fetch(window.location.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})}).then(res=>res.json()).then(data=>{document.getElementById('chatbox').innerHTML+='<div><b>GPT:</b> '+data.response+'</div>';document.getElementById('chatinput').value='';});}</script>";
                
                context.response.writePage(form);
            } else if (context.request.method === 'POST') {
                let requestBody = JSON.parse(context.request.body).message;
                let gptResponse = callGPT(requestBody);
                
                context.response.write(JSON.stringify({response: gptResponse}));
            }
        };
        
        const callGPT = (question) => {
            try {
                const response = llm.generateText({
                    prompt: question,
                    modelParameters: {
                        maxTokens: 1000,
                        temperature: 0.2,
                        topK: 3,
                        topP: 0.7,
                        frequencyPenalty: 0.4,
                        presencePenalty: 0
                    }
                });
                return response.text;
            } catch (e) {
                log.error({title: 'Lỗi khi gọi GPT', details: e});
                return 'Đã xảy ra lỗi khi gọi GPT, vui lòng thử lại.';
            }
        };
        
        return {
            onRequest
        };
    });
