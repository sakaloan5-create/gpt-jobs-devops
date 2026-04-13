#!/usr/bin/env python3
"""Deploy to Cloud Run using the REST API directly, bypassing gcloud CLI."""
import json
import os
import sys
import time
import urllib.request
import urllib.error

ACCESS_TOKEN = os.environ['ACCESS_TOKEN']
PROJECT = os.environ['GCP_PROJECT_ID']
REGION = os.environ['GCP_REGION']
SERVICE = os.environ['SERVICE_NAME']
IMAGE = os.environ['IMAGE_TAG']
NODE_ENV = os.environ['NODE_ENV']

headers = {
    'Authorization': f'Bearer {ACCESS_TOKEN}',
    'Content-Type': 'application/json',
}

service_url = f'https://run.googleapis.com/v2/projects/{PROJECT}/locations/{REGION}/services/{SERVICE}'

service_body = {
    'template': {
        'containers': [{
            'image': IMAGE,
            'env': [
                {'name': 'NODE_ENV', 'value': NODE_ENV},
                {'name': 'FIREBASE_PROJECT_ID', 'value': PROJECT},
            ],
            'resources': {
                'limits': {'cpu': '1', 'memory': '512Mi'}
            },
        }],
        'maxInstanceCount': 10,
        'timeout': '300s',
    },
    'traffic': [
        {'type': 'TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST', 'percent': 100}
    ],
}


def api_request(url, method='GET', body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


# Check existence
status, resp = api_request(service_url)
exists = status == 200
print(f'Service exists: {exists} (HTTP {status})')

if exists:
    update_url = f'{service_url}?updateMask=template,traffic'
    status, resp = api_request(update_url, 'PATCH', service_body)
    print(f'Update status: {status}')
    if status not in (200, 202):
        print('Update failed:', json.dumps(resp, indent=2))
        sys.exit(1)
else:
    create_url = f'https://run.googleapis.com/v2/projects/{PROJECT}/locations/{REGION}/services'
    body = dict(service_body)
    body['name'] = f'projects/{PROJECT}/locations/{REGION}/services/{SERVICE}'
    body['labels'] = {'managed-by': 'github-actions'}
    status, resp = api_request(create_url, 'POST', body)
    print(f'Create status: {status}')
    if status not in (200, 202):
        print('Create failed:', json.dumps(resp, indent=2))
        sys.exit(1)

# Poll for readiness
print('Waiting for service to be ready...')
url = ''
for i in range(36):
    time.sleep(5)
    status, svc = api_request(service_url)
    if status != 200:
        print(f'  Polling attempt {i+1}: HTTP {status}')
        continue
    conditions = svc.get('status', {}).get('conditions', [])
    ready = any(c.get('type') == 'Ready' and c.get('state') == 'CONDITION_SUCCEEDED' for c in conditions)
    url = svc.get('status', {}).get('url', '')
    print(f'  Attempt {i+1}: ready={ready}, url={url}')
    if ready and url:
        break
else:
    print('Timeout waiting for service readiness')
    sys.exit(1)

# Set IAM policy
iam_url = f'{service_url}:setIamPolicy'
iam_body = {
    'policy': {
        'bindings': [
            {'role': 'roles/run.invoker', 'members': ['allUsers']}
        ]
    }
}
status, resp = api_request(iam_url, 'POST', iam_body)
print(f'IAM status: {status}')
if status != 200:
    print('IAM update failed:', json.dumps(resp, indent=2))
    sys.exit(1)

print(f'DEPLOYED_URL={url}')
with open(os.environ.get('GITHUB_ENV', '/dev/null'), 'a') as f:
    f.write(f'DEPLOYED_URL={url}\n')

print('Done.')
