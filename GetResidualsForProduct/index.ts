import { AzureFunction, Context, HttpRequest } from "@azure/functions"

function getVehicleAgeInMonths(regDate) {
    let dateFrom = new Date;
    let dateTo = new Date(regDate);
    let monthsInSameYearDifference = dateTo.getMonth() - dateFrom.getMonth();
    let monthsFromYearDifference = (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
    return Math.abs(monthsFromYearDifference + monthsInSameYearDifference);
}

function validateInput (input) {
    let requiredInput = ['capCode','regDate','annualMiles','currentMiles', 'term'];
    let errors = [];
    for (let field of requiredInput) {
        if (!input[field]) {
            errors.push('Missing Field ' + field); 
        }
    }
    return errors;
}

function getGuarenteedFutureValue (input) {
    let baseValue = 10000;
    let term = parseInt(input['term']);

    let annualMiles = parseInt(input['annualMiles']);
    let currentMiles = parseInt(input['currentMiles']);
    let endMileage = Math.round(currentMiles + ( term * (annualMiles/12) ));

    let vehicleAgeInMonths = getVehicleAgeInMonths(input['regDate']);
    let vehicleAgeInMonthsAtEnd = vehicleAgeInMonths + term;
    return  Math.round(baseValue - (baseValue / 120 * vehicleAgeInMonthsAtEnd));
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let payload = {};
    let input = req.query;
    let errors = validateInput(input);
    if (errors.length != 0) {
        context.res = {
            body: {
                errors: errors
            }
        };
        return;
    }

    payload['guarenteedFutureValue'] = getGuarenteedFutureValue(input);
    context.res = {
        body: payload
    };

};

export default httpTrigger;