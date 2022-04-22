import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const question = (req.query.question || (req.body && req.body.question));
    let options = ["Yes", "No", "Maybe"];
    let answer = options[Math.floor(Math.random() * options.length)];
    const responseMessage = question
        ? 'To your question "' + question +'" the answer is "'+answer+'"'
        : "If you can not be bothered to ask a question, I can not be bothered to answer";

    context.res = {
        body: responseMessage
    };

};

export default httpTrigger;