# Study Groups Deployment Troubleshooting

## Problem (Resolved)
Study groups component was not visible after deployment because old frontend files were being served from a persisted Docker volume.

## Investigation Steps

### 1. Build Process Analysis
- [ ] Check Docker build context
- [ ] Verify frontend build output
- [ ] Confirm file copying in Dockerfile
- [ ] Check static file collection

### 2. File System Verification
- [ ] Check actual files in container
- [ ] Verify file timestamps
- [ ] Compare local vs container files

### 3. Django Static Files
- [ ] Check Django static files configuration
- [ ] Verify collectstatic process
- [ ] Check nginx static file serving

## Findings

### Root Cause Identified
Persisted named Docker volume `course-organizer_static_files` (mounted at `/app/static`) contained old assets and masked freshly built assets copied into the image at build time. As a result, even after rebuilding, Nginx served stale files.

### Evidence
- Container `/app/static/browser` showed September 19 timestamps before fix.
- Nginx served chunks from stale static dir.
- After removing `course-organizer_static_files` and re-running `collectstatic`, new chunks appeared (e.g., `chunk-2DQ6464N.js`, `chunk-KC5QOTPA.js`) and routes reflected study groups.

### Issue Analysis
1. Deployment used a named volume for static files.
2. New image copied frontend build into `/app/static/browser` during build, but runtime mount of `static_files` volume overrode it.
3. Volume contained stale assets from previous deploys.
4. Clearing the volume and running `collectstatic` repopulated with fresh assets.

## Preventive Fixes
1. Deployment script now:
   - Stops services
   - Removes `course-organizer_static_files` volume
   - Builds images with `--no-cache`
   - Starts services
   - Runs `collectstatic` to repopulate fresh assets
2. This prevents stale static from masking new builds.

## Solution
The issue is that the Docker build is using cached layers. We need to:
1. Deploy the current files (which are correct)
2. Force a complete rebuild without cache
3. Verify the frontend build includes the study groups component

## Commands Used
```bash
# Complete rebuild
docker system prune -a -f
docker compose build --no-cache
docker compose up -d
```

## Root Cause Found
The deployment script uses `--build` flag which uses cached layers. All build steps show `CACHED` which means the frontend wasn't actually rebuilt with the new files.

## Solution
Implemented in `deploy-to-gce.sh` (remove static volume, no-cache build, collectstatic). Verified via Nginx logs and presence of study-group chunks.
