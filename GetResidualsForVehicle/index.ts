import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const BASE_VALUE = 10000;
const MILEAGE_OFFSET_MULTIPLIER = 500;
const REQUIRED_INPUT_KEYS = ['capCode','regDate','annualMiles','currentMiles', 'term'];

function getVehicleAgeInMonths(regDate) {
    let dateFrom = new Date;
    let dateTo = new Date(regDate);
    let monthsInSameYearDifference = dateTo.getMonth() - dateFrom.getMonth();
    let monthsFromYearDifference = (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
    return Math.abs(monthsFromYearDifference + monthsInSameYearDifference);
}

function validateInput (input) {
    let errors = [];
    for (let field of REQUIRED_INPUT_KEYS) {
        if (!input[field]) {
            errors.push('Missing Field ' + field); 
        }
    }
    return errors;
}

function getGuarenteedFutureValue (input) {
    let baseValue = BASE_VALUE;
    let term = parseInt(input['term']);

    let annualMiles = parseInt(input['annualMiles']);
    let currentMiles = parseInt(input['currentMiles']);
    let endMileage = Math.round(currentMiles + ( term * (annualMiles/12) ));


    let mileageOffset = (baseValue / endMileage) * MILEAGE_OFFSET_MULTIPLIER;


    let vehicleAgeInMonths = getVehicleAgeInMonths(input['regDate']);
    let vehicleAgeInMonthsAtEnd = vehicleAgeInMonths + term;

    let modifiedValue = (baseValue - (baseValue / 120 * vehicleAgeInMonthsAtEnd));
    return Math.round(modifiedValue - mileageOffset);
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